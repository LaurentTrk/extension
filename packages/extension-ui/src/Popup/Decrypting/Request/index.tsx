// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import type { AccountJson, RequestDecrypt } from '@polkadot/extension-base/background/types';
import type { ExtrinsicPayload } from '@polkadot/types/interfaces';
import type { DecryptPayloadRaw } from '@polkadot/types/types';

import React, { useCallback, useContext, useEffect, useState } from 'react';

// import { TypeRegistry } from '@polkadot/types';
import { decodeAddress } from '@polkadot/util-crypto';

import { AccountContext, ActionContext, Address, VerticalSpace } from '../../../components';
import { approveDecrypting } from '../../../messaging';
import Bytes from '../Bytes';
// import Extrinsic from '../Extrinsic';
// import LedgerSign from '../LedgerSign';
import Qr from '../Qr';
import DecryptArea from './DecryptArea';

interface Props {
  account: AccountJson;
  buttonText: string;
  isFirst: boolean;
  request: RequestDecrypt;
  decryptId: string;
  url: string;
}

interface Data {
  hexBytes: string | null;
  payload: ExtrinsicPayload | null;
}

export const CMD_MORTAL = 2;
export const CMD_SIGN_MESSAGE = 3;

// keep it global, we can and will re-use this across requests
// const registry = new TypeRegistry();

export default function Request ({ account: { accountIndex, addressOffset, isExternal, isHardware }, buttonText, isFirst, request, decryptId, url }: Props): React.ReactElement<Props> | null {
  const onAction = useContext(ActionContext);
  const [{ hexBytes }, setData] = useState<Data>({ hexBytes: null, payload: null });
  const [error, setError] = useState<string | null>(null);
  const { accounts } = useContext(AccountContext);

  useEffect((): void => {
    const payload = request.payload;

    setData({
      hexBytes: payload.data,
      payload: null
    });
  }, [request]);

  const _onSignature = useCallback(
    ({ signature }: { signature: string }): Promise<void> =>
      approveDecrypting(decryptId, signature)
        .then(() => onAction())
        .catch((error: Error): void => {
          setError(error.message);
          console.error(error);
        }),
    [onAction, decryptId]
  );

if (hexBytes !== null) {
    const { address, data } = request.payload as DecryptPayloadRaw;
    const account = accounts.find((account) => decodeAddress(account.address).toString() === decodeAddress(address).toString());

    return (
      <>
        <div>
          <Address
            address={address}
            isExternal={isExternal}
          />
        </div>
        {isExternal && !isHardware && account?.genesisHash
          ? (
            <Qr
              address={address}
              cmd={CMD_SIGN_MESSAGE}
              genesisHash={account.genesisHash}
              onSignature={_onSignature}
              payload={data}
            />
          )
          : (
            <Bytes
              bytes={data}
              url={url}
            />
          )
        }
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

  return null;
}
