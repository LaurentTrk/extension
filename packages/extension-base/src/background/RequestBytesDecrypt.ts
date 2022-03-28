// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair } from '@polkadot/keyring/types';
import type { SignerPayloadRaw } from '@polkadot/types/types';
import type { RequestDecrypt } from './types';

import { wrapBytes } from '@polkadot/extension-dapp/wrapBytes';
import { TypeRegistry } from '@polkadot/types';
import { u8aToHex, hexToU8a } from '@polkadot/util';

export default class RequestBytesDecrypt implements RequestDecrypt {
  public readonly payload: SignerPayloadRaw;

  constructor (payload: SignerPayloadRaw) {
    this.payload = payload;
  }

  decrypt (_registry: TypeRegistry, pair: KeyringPair): { decrypted: string } {
    console.log("pair", pair);
    console.log("this.payload.data", this.payload.data);
    console.log("wrapBytes(this.payload.data)", wrapBytes(this.payload.data));
    return {
      decrypted: u8aToHex(
        pair.decrypt(
          hexToU8a(this.payload.data)
        )
      )
    };
  }
}