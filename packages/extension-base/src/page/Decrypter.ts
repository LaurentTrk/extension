// Copyright 2019-2021 @polkadot/extension-base authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { InjectedDecrypter } from '@polkadot/extension-dapp';
import { DecrypterResult, DecryptPayload } from '@polkadot/extension-inject/types';
import type { SendRequest } from './types';

// External to class, this.# is not private enough (yet)
let sendRequest: SendRequest;
let nextId = 0;

export default class Decrypter implements InjectedDecrypter {
  constructor (_sendRequest: SendRequest) {
    sendRequest = _sendRequest;
  }

  public async decrypt (payload: DecryptPayload): Promise<DecrypterResult> {
    const id = ++nextId;
    const result = await sendRequest('pub(bytes.decrypt)', payload);

    // we add an internal id (number) - should have a mapping from the
    // extension id (string) -> internal id (number) if we wish to provide
    // updated via the update functionality (noop at this point)
    return {
      ...result,
      id
    };
  }
}
