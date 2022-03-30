// Copyright 2019-2021 @polkadot/extension authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { Injected } from '@polkadot/extension-inject/types';
import type { SendRequest } from './types';

import Accounts from './Accounts';
import Metadata from './Metadata';
import PostMessageProvider from './PostMessageProvider';
import Signer from './Signer';
import Decrypter from './Decrypter';

export default class implements Injected {
  public readonly accounts: Accounts;

  public readonly metadata: Metadata;

  public readonly provider: PostMessageProvider;

  public readonly signer: Signer;

  public readonly decrypter: Decrypter;

  constructor (sendRequest: SendRequest) {
    this.accounts = new Accounts(sendRequest);
    this.metadata = new Metadata(sendRequest);
    this.provider = new PostMessageProvider(sendRequest);
    this.signer = new Signer(sendRequest);
    this.decrypter = new Decrypter(sendRequest);
  }
}
