// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { KeyringPair } from '@polkadot/keyring/types';
import { DecryptPayload } from '@polkadot/extension-inject/types';
import { TypeRegistry } from '@polkadot/types';
import { u8aToHex } from '@polkadot/util';
import { HexString } from '@polkadot/util/types';

import type { RequestDecrypt } from './types';

export default class RequestBytesDecrypt implements RequestDecrypt {
  public readonly payload: DecryptPayload;

  constructor (payload: DecryptPayload) {
    this.payload = payload;
  }

  decrypt (_registry: TypeRegistry, pair: KeyringPair): { decrypted: HexString | null } {
    const rawDecrypted = pair.decrypt(this.payload.encrypted);
    if(rawDecrypted) {
      return {
        decrypted: u8aToHex(rawDecrypted)
      };
    } else {
      return { decrypted: null };
    }
  }
}
