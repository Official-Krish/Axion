import type { Idl } from "@coral-xyz/anchor";

const idl = {
  address: "BD8qpWm9WWLcqQu5PKJ3Lew4BZ6nh6n96FMZv3DJ54sc",
  metadata: {
    name: "contract",
    version: "0.1.0",
    spec: "0.1.0",
    description: "Created with Anchor",
  },
  instructions: [
    {
      name: "activate_host",
      accounts: [
        { name: "user", writable: true, signer: true },
        { name: "host" },
        {
          name: "host_machine",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  104, 111, 115, 116, 95, 109, 97, 99, 104, 105, 110, 101,
                ],
              },
              { kind: "account", path: "host" },
              { kind: "arg", path: "id" },
            ],
          },
        },
        { name: "system_program", address: "11111111111111111111111111111111" },
      ],
      args: [{ name: "id", type: "string" }],
    },
    {
      name: "claim_rewards",
      accounts: [
        { name: "host", writable: true, signer: true },
        {
          name: "host_machine",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  104, 111, 115, 116, 95, 109, 97, 99, 104, 105, 110, 101,
                ],
              },
              { kind: "account", path: "host" },
              { kind: "arg", path: "id" },
            ],
          },
        },
        { name: "admin" },
        {
          name: "vault_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  118, 97, 117, 108, 116, 95, 97, 99, 99, 111, 117, 110, 116,
                ],
              },
              { kind: "account", path: "admin" },
              {
                kind: "const",
                value: [97, 120, 105, 111, 110, 95, 118, 97, 117, 108, 116],
              },
            ],
          },
        },
        { name: "system_program", address: "11111111111111111111111111111111" },
      ],
      args: [{ name: "id", type: "string" }],
    },
    {
      name: "deactivate_host",
      accounts: [
        { name: "user", writable: true, signer: true },
        { name: "host" },
        {
          name: "host_machine",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  104, 111, 115, 116, 95, 109, 97, 99, 104, 105, 110, 101,
                ],
              },
              { kind: "account", path: "host" },
              { kind: "arg", path: "id" },
            ],
          },
        },
        { name: "system_program", address: "11111111111111111111111111111111" },
      ],
      args: [{ name: "id", type: "string" }],
    },
    {
      name: "end_rental_session",
      accounts: [
        { name: "payer", writable: true, signer: true },
        {
          name: "rental_session",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  114, 101, 110, 116, 97, 108, 95, 115, 101, 115, 115, 105, 111,
                  110,
                ],
              },
              { kind: "arg", path: "_user_pub_key" },
              { kind: "arg", path: "_id" },
            ],
          },
        },
      ],
      args: [
        { name: "id", type: "string" },
        { name: "_user_pub_key", type: "pubkey" },
      ],
    },
    {
      name: "force_terminate_rental",
      accounts: [
        { name: "admin", writable: true, signer: true },
        { name: "user" },
        {
          name: "rental_session",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  114, 101, 110, 116, 97, 108, 95, 115, 101, 115, 115, 105, 111,
                  110,
                ],
              },
              { kind: "account", path: "user" },
              { kind: "arg", path: "id" },
            ],
          },
        },
        {
          name: "escrow_session",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  101, 115, 99, 114, 111, 119, 95, 115, 101, 115, 115, 105, 111,
                  110,
                ],
              },
              { kind: "account", path: "user" },
              { kind: "arg", path: "id" },
            ],
          },
        },
        {
          name: "escrow_vault",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  101, 115, 99, 114, 111, 119, 95, 118, 97, 117, 108, 116,
                ],
              },
              { kind: "account", path: "user" },
              { kind: "account", path: "admin" },
              { kind: "arg", path: "id" },
            ],
          },
        },
        {
          name: "vault_account",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  118, 97, 117, 108, 116, 95, 97, 99, 99, 111, 117, 110, 116,
                ],
              },
              { kind: "account", path: "admin" },
              {
                kind: "const",
                value: [97, 120, 105, 111, 110, 95, 118, 97, 117, 108, 116],
              },
            ],
          },
        },
        { name: "system_program", address: "11111111111111111111111111111111" },
      ],
      args: [{ name: "id", type: "string" }],
    },
    {
      name: "initialise_host_registration",
      accounts: [
        { name: "admin", writable: true, signer: true },
        { name: "user_key" },
        {
          name: "host_machine_registration",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  104, 111, 115, 116, 95, 109, 97, 99, 104, 105, 110, 101,
                ],
              },
              { kind: "account", path: "user_key" },
              { kind: "arg", path: "id" },
            ],
          },
        },
        { name: "system_program", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "id", type: "string" },
        { name: "host_name", type: "string" },
        { name: "machine_type", type: "string" },
        { name: "os", type: "string" },
        { name: "disk_size", type: "u64" },
        { name: "sol_per_hour", type: "u64" },
      ],
    },
    {
      name: "penalize_host",
      accounts: [
        { name: "admin", writable: true, signer: true },
        { name: "user" },
        {
          name: "host_machine",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  104, 111, 115, 116, 95, 109, 97, 99, 104, 105, 110, 101,
                ],
              },
              { kind: "account", path: "user" },
              { kind: "arg", path: "id" },
            ],
          },
        },
      ],
      args: [{ name: "id", type: "string" }],
    },
    {
      name: "settle_depin_job",
      accounts: [
        { name: "admin", writable: true, signer: true },
        { name: "renter", writable: true },
        { name: "host", writable: true },
        { name: "platform_vault", writable: true },
        {
          name: "rental_session",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  114, 101, 110, 116, 97, 108, 95, 115, 101, 115, 115, 105, 111,
                  110,
                ],
              },
              { kind: "account", path: "renter" },
              { kind: "arg", path: "id" },
            ],
          },
        },
        {
          name: "escrow_session",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  101, 115, 99, 114, 111, 119, 95, 115, 101, 115, 115, 105, 111,
                  110,
                ],
              },
              { kind: "account", path: "renter" },
              { kind: "arg", path: "id" },
            ],
          },
        },
        {
          name: "escrow_vault",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  101, 115, 99, 114, 111, 119, 95, 118, 97, 117, 108, 116,
                ],
              },
              { kind: "account", path: "renter" },
              { kind: "account", path: "admin" },
              { kind: "arg", path: "id" },
            ],
          },
        },
        {
          name: "host_machine",
          writable: true,
          pda: {
            seeds: [
              {
                kind: "const",
                value: [
                  104, 111, 115, 116, 95, 109, 97, 99, 104, 105, 110, 101,
                ],
              },
              { kind: "account", path: "host" },
              { kind: "arg", path: "id" },
            ],
          },
        },
        { name: "system_program", address: "11111111111111111111111111111111" },
      ],
      args: [
        { name: "id", type: "string" },
        { name: "host_earned", type: "u64" },
        { name: "platform_fee_bps", type: "u16" },
      ],
    },
  ],
} as Idl;

export default idl;
