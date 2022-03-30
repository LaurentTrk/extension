// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, RequestDecrypt } from '@polkadot/extension-base/background/types';

import React, { useState } from 'react';

import { Address, VerticalSpace } from '../../../components';
import Bytes from '../../Signing/Bytes';
import DecryptArea from './DecryptArea';

interface Props {
  account: AccountJson;
  buttonText: string;
  isFirst: boolean;
  request: RequestDecrypt;
  decryptId: string;
  url: string;
}

export const CMD_MORTAL = 2;
export const CMD_SIGN_MESSAGE = 3;

// keep it global, we can and will re-use this across requests
// const registry = new TypeRegistry();

export default function Request ({ account: { isExternal }, buttonText, isFirst, request, decryptId, url }: Props): React.ReactElement<Props> | null {
  const [ error, setError ] = useState<string | null>(null);
  const { address, encrypted } = request.payload;

  return (
    <>
      <div>
        <Address
          address={address}
          isExternal={isExternal}
        />
      </div>

      <Bytes
        bytes={encrypted}
        url={url}
      />

      <VerticalSpace />

      <DecryptArea
        buttonText={buttonText}
        error={error}
        isExternal={isExternal}
        isFirst={isFirst}
        setError={setError}
        decryptId={decryptId}
      />
    </>
  );
}
