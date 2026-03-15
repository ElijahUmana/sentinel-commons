#!/usr/bin/env python3
"""
Bittensor Audit Trail — Store safety evaluation hashes on Bittensor testnet.

This creates a censorship-resistant, immutable record of every safety evaluation.
The hash persists even if our servers are destroyed, our accounts suspended,
or data deletion is legally ordered.

Usage:
    python3 safety/bittensor_audit.py '{"agentId":"test","score":0.95,...}'

Returns JSON: {"success": true, "hash": "...", "block_hash": "...", ...}
"""
import sys
import json
import hashlib


def compute_hash(evaluation_data: dict) -> str:
    """Create a deterministic SHA-256 hash of evaluation data."""
    data_str = json.dumps(evaluation_data, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(data_str.encode()).hexdigest()


def store_hash_on_bittensor(evaluation_data: dict) -> dict:
    """Hash evaluation data and attempt to store on Bittensor testnet."""
    hash_hex = compute_hash(evaluation_data)

    try:
        import bittensor as bt

        # Connect to testnet
        subtensor = bt.Subtensor(network="test")
        wallet = bt.Wallet(name="sentinel")

        # Submit hash as system.remark extrinsic
        call = subtensor.substrate.compose_call(
            call_module="System",
            call_function="remark",
            call_params={"remark": bytes.fromhex(hash_hex)},
        )
        extrinsic = subtensor.substrate.create_signed_extrinsic(
            call=call, keypair=wallet.coldkey
        )
        receipt = subtensor.substrate.submit_extrinsic(
            extrinsic, wait_for_inclusion=True
        )

        return {
            "success": True,
            "hash": hash_hex,
            "block_hash": str(receipt.block_hash) if hasattr(receipt, 'block_hash') else None,
            "extrinsic_hash": str(receipt.extrinsic_hash) if hasattr(receipt, 'extrinsic_hash') else None,
            "network": "bittensor-testnet",
            "wallet": wallet.coldkeypub.ss58_address,
        }
    except Exception as e:
        # If Bittensor submission fails (no TAO, network issues), still return hash
        return {
            "success": False,
            "hash": hash_hex,
            "error": str(e),
            "note": "Hash computed but Bittensor submission failed. The hash can be verified locally and submitted later.",
            "network": "bittensor-testnet",
        }


def main():
    if len(sys.argv) > 1:
        try:
            data = json.loads(sys.argv[1])
        except json.JSONDecodeError:
            data = {"raw": sys.argv[1]}
    else:
        # Read from stdin
        data = json.loads(sys.stdin.read())

    result = store_hash_on_bittensor(data)
    print(json.dumps(result))


if __name__ == "__main__":
    main()
