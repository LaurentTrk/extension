// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair } from '@polkadot/keyring/types';
import type { DecryptPayloadRaw } from '@polkadot/types/types';
import type { RequestDecrypt } from './types';
import type { HexString } from '@polkadot/util/types';

import { wrapBytes } from '@polkadot/extension-dapp/wrapBytes';
import { TypeRegistry } from '@polkadot/types';
import { u8aToHex, hexToU8a } from '@polkadot/util';

export default class RequestBytesDecrypt implements RequestDecrypt {
  public readonly payload: DecryptPayloadRaw;

  constructor (payload: DecryptPayloadRaw) {
    this.payload = payload;
  }

  decrypt (_registry: TypeRegistry, pair: KeyringPair, recipientPublicKey: HexString | string | Uint8Array): { decrypted: string } {
    console.log("pair", pair);
    console.log("this.payload.data", this.payload.data);
    console.log("wrapBytes(this.payload.data)", wrapBytes(this.payload.data));
    console.log("recipientPublicKey", recipientPublicKey);
    return {
      decrypted: u8aToHex(
        pair.decryptMessage(
          hexToU8a(this.payload.data), recipientPublicKey
        )
      )
    };
  }
}
