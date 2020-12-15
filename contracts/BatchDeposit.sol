// SPDX-License-Identifier: WTFPL
pragma solidity 0.6.11;
pragma experimental ABIEncoderV2;

import "./DepositInterface.sol";

// Author: Sylvain Laurent
// Use Scribble https://docs.scribble.codes/tool/cli-usage#emitting-a-flat-instrumented-file to generate guards / arm the contract

contract BatchDeposit is IDepositContract {
    IDepositContract public deposit_contract;

    // https://github.com/ethereum/eth2.0-specs/blob/dev/specs/phase0/beacon-chain.md#gwei-values
    uint256 constant MAX_EFFECTIVE_DEPOSIT_AMOUNT = 32 ether;

    // Prevent transaction creation with gas usage too close to block gas limit
    uint256 constant MAX_VALIDATORS_VARIABLE = 100; // TODO Adjust to aims for 75% of block gas limit
    uint256 constant MAX_VALIDATORS = 100; // TODO Adjust to aims for 75% of block gas limit

    /// @notice Deploy a contract tied to selected deposit contract.
    /// @param _deposit_contract A deposit contract address (see IDepositContract).
    constructor(address _deposit_contract) public {
        // Network contract address
        // Mainnet 0x00000000219ab540356cbb839cbe05303d7705fa @chain id:1
        // Pyrmont 0x28aa7D30eb27b8955930beE3bC72255ab6a574D9 @chain id:5
        deposit_contract = IDepositContract(_deposit_contract);
    }

    /// @notice Submit multiple Phase 0 DepositData object with variable amount per deposit.
    /// @param pubkeys An array of BLS12-381 public key.
    /// @param withdrawal_credentials An array of commitment to public keys for withdrawals.
    /// @param signatures An array of BLS12-381 signature.
    /// @param deposit_data_roots An array of SHA-256 hash of the SSZ-encoded DepositData object.
    /// @param amounts An array of amount, must be above or equal 1 eth.
    /// Used as a protection against malformed input.
    /// if_succeeds {:msg "number of input elements too important"} old(pubkeys.length) <= MAX_VALIDATORS_VARIABLE;
    /// if_succeeds {:msg "number of withdrawal_credentials mismatch the number of public keys"} old(pubkeys.length) <= old(withdrawal_credentials.length);
    /// if_succeeds {:msg "number of signatures mismatch the number of public keys"} old(pubkeys.length) <= old(signatures.length);
    /// if_succeeds {:msg "number of amounts mismatch the number of public keys"} old(pubkeys.length) <= old(amounts.length);
    /// if_succeeds {:msg "number of deposit_data_roots mismatch the number of public keys"} old(pubkeys.length) <= old(deposit_data_roots.length);
    /// if_succeeds {:msg "supplied ether value mismatch the total deposited sum"} deposited_amount == msg.value;
    function batchDepositVariable(
        bytes[] calldata pubkeys,
        bytes[] calldata withdrawal_credentials,
        bytes[] calldata signatures,
        bytes32[] calldata deposit_data_roots,
        uint64[] calldata amounts
    ) external payable returns (uint256 deposited_amount) {
        require(pubkeys.length <= MAX_VALIDATORS_VARIABLE);
        require(pubkeys.length == withdrawal_credentials.length);
        require(pubkeys.length == signatures.length);
        require(pubkeys.length == amounts.length);
        require(pubkeys.length == deposit_data_roots.length);

        for (uint256 i = 0; i < pubkeys.length; i++) {
            deposit_contract.deposit{value: amounts[i]}(
                pubkeys[i],
                withdrawal_credentials[i],
                signatures[i],
                deposit_data_roots[i]
            );
            deposited_amount += uint256(amounts[i]);
        }
        require(msg.value == deposited_amount);
    }

    /// @notice Submit multiple Phase 0 DepositData object with a fixed 32 eth amount.
    /// @param pubkeys An array of BLS12-381 public key.
    /// @param withdrawal_credentials An array of commitment to public keys for withdrawals.
    /// @param signatures An array of BLS12-381 signature.
    /// @param deposit_data_roots An array of SHA-256 hash of the SSZ-encoded DepositData object.
    /// Used as a protection against malformed input.
    /// if_succeeds {:msg "number of input elements too important"} old(pubkeys.length) <= MAX_VALIDATORS_VARIABLE;
    /// if_succeeds {:msg "number of withdrawal_credentials mismatch the number of public keys"} old(pubkeys.length) <= old(withdrawal_credentials.length);
    /// if_succeeds {:msg "number of signatures mismatch the number of public keys"} old(pubkeys.length) <= old(signatures.length);
    /// if_succeeds {:msg "number of deposit_data_roots mismatch the number of public keys"} old(pubkeys.length) <= old(deposit_data_roots.length);
    /// if_succeeds {:msg "supplied ether value mismatch the total deposited sum"} old(pubkeys.length)*MAX_EFFECTIVE_DEPOSIT_AMOUNT == msg.value;
    function batchDeposit(
        bytes[] calldata pubkeys,
        bytes[] calldata withdrawal_credentials,
        bytes[] calldata signatures,
        bytes32[] calldata deposit_data_roots
    ) external payable {
        require(pubkeys.length <= MAX_VALIDATORS);
        require(pubkeys.length == withdrawal_credentials.length);
        require(pubkeys.length == signatures.length);
        require(pubkeys.length == deposit_data_roots.length);
        require(pubkeys.length * MAX_EFFECTIVE_DEPOSIT_AMOUNT == msg.value);

        for (uint256 i = 0; i < pubkeys.length; i++) {
            deposit_contract.deposit{value: MAX_EFFECTIVE_DEPOSIT_AMOUNT}(
                pubkeys[i],
                withdrawal_credentials[i],
                signatures[i],
                deposit_data_roots[i]
            );
        }
    }

    /// @notice Submit a Phase 0 DepositData object.
    /// @param pubkey A BLS12-381 public key.
    /// @param withdrawal_credentials Commitment to a public key for withdrawals.
    /// @param signature A BLS12-381 signature.
    /// @param deposit_data_root The SHA-256 hash of the SSZ-encoded DepositData object.
    /// Used as a protection against malformed input.
    function deposit(
        bytes calldata pubkey,
        bytes calldata withdrawal_credentials,
        bytes calldata signature,
        bytes32 deposit_data_root
    ) external override payable {
        deposit_contract.deposit(
            pubkey,
            withdrawal_credentials,
            signature,
            deposit_data_root
        );
    }

    /// @notice Query the current deposit root hash.
    /// @return The deposit root hash.
    function get_deposit_root() external override view returns (bytes32) {
        return deposit_contract.get_deposit_root();
    }

    /// @notice Query the current deposit count.
    /// @return The deposit count encoded as a little endian 64-bit number.
    function get_deposit_count() external override view returns (bytes memory) {
        return deposit_contract.get_deposit_count();
    }
}
