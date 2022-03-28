// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

// import type { DecryptPayloadRaw } from '@polkadot/types/types';

import React, { useCallback, useContext, useEffect, useState } from 'react';

import { Loading, DecryptingReqContext } from '../../components';
import useTranslation from '../../hooks/useTranslation';
import { Header } from '../../partials';
import Request from './Request';
import TransactionIndex from './TransactionIndex';

export default function Decrypting (): React.ReactElement {
  const { t } = useTranslation();
  const requests = useContext(DecryptingReqContext);
  const [requestIndex, setRequestIndex] = useState(0);

  const _onNextClick = useCallback(
    () => setRequestIndex((requestIndex) => requestIndex + 1),
    []
  );

  const _onPreviousClick = useCallback(
    () => setRequestIndex((requestIndex) => requestIndex - 1),
    []
  );

  useEffect(() => {
    setRequestIndex(
      (requestIndex) => requestIndex < requests.length
        ? requestIndex
        : requests.length - 1
    );
  }, [requests]);

  // protect against removal overflows/underflows
  const request = requests.length !== 0
    ? requestIndex >= 0
      ? requestIndex < requests.length
        ? requests[requestIndex]
        : requests[requests.length - 1]
      : requests[0]
    : null;
  
  return request
    ? (
      <>
        <Header text={t<string>('Decrypt message')}>
          {requests.length > 1 && (
            <TransactionIndex
              index={requestIndex}
              onNextClick={_onNextClick}
              onPreviousClick={_onPreviousClick}
              totalItems={requests.length}
            />
          )}
        </Header>
        <Request
          account={request.account}
          buttonText={t('Decrypt the message')}
          isFirst={requestIndex === 0}
          request={request.request}
          decryptId={request.id}
          url={request.url}
        />
      </>
    )
    : <Loading />;
}
