// Copyright 2019-2021 @polkadot/extension-ui authors & contributors
// SPDX-License-Identifier: Apache-2.0

import '@polkadot/extension-mocks/chrome';

import type { DecryptingRequest } from '@polkadot/extension-base/background/types';

import Adapter from '@wojtekmaj/enzyme-adapter-react-17';
import { configure, mount, ReactWrapper } from 'enzyme';
import { EventEmitter } from 'events';
import React, { useState } from 'react';
import { act } from 'react-dom/test-utils';
import { ThemeProvider } from 'styled-components';

import { ActionContext, Address, Button, Input, DecryptingReqContext, themes } from '../../components';
import * as messaging from '../../messaging';
import * as MetadataCache from '../../MetadataCache';
import TransactionIndex from '../Signing/TransactionIndex';
import { flushAllPromises } from '../../testHelpers';
import { westendMetadata } from './metadataMock';
import Request from './Request';
import Decrypting from '.';
import Bytes from '../Signing/Bytes';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment,@typescript-eslint/no-unsafe-call
configure({ adapter: new Adapter() });

describe('Decryption requests', () => {
  let wrapper: ReactWrapper;
  let onActionStub: jest.Mock;
  let decryptRequests: DecryptingRequest[] = [];
  const encrypted = '0xe55bc3c2002b5e5659a1ed20de7d3275cde0584632c78713f39d2f98de60c4c45adcae2cd4cdb8634499fa30e9178bf522a273f0a6749234922d9a33c121975930d70f43c73c8ec68a872c5fb136d683dbc3daf09956165160a778ca6b14b9f82d62564770e432e30b00f9f5823360479491f7c43af0f5418286cb07d8e3c2d8aba72ae1ef26355dc067e06d';

  const emitter = new EventEmitter();

  function MockRequestsProvider (): React.ReactElement {
    const [requests, setRequests] = useState(decryptRequests);

    emitter.on('request', setRequests);

    return (
      <DecryptingReqContext.Provider value={requests}>
        <Decrypting />
      </DecryptingReqContext.Provider>
    );
  }

  const mountComponent = async (): Promise<void> => {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    wrapper = mount(
      <ActionContext.Provider value={onActionStub}>
        <ThemeProvider theme={themes.dark}>
          <MockRequestsProvider />
        </ThemeProvider>
      </ActionContext.Provider>
    );
    await act(flushAllPromises);
    wrapper.update();
  };

  const check = (input: ReactWrapper): unknown => input.simulate('change', { target: { checked: true } });

  beforeEach(async () => {
    jest.spyOn(messaging, 'cancelDecryptRequest').mockResolvedValue(true);
    jest.spyOn(messaging, 'approveDecryptPassword').mockResolvedValue(true);
    jest.spyOn(messaging, 'isSignLocked').mockResolvedValue({ isLocked: true, remainingTime: 0 });
    jest.spyOn(MetadataCache, 'getSavedMeta').mockResolvedValue(westendMetadata);

    decryptRequests = [
      {
        account: {
          address: '5D4bqjQRPgdMBK8bNvhX4tSuCtSGZS7rZjD5XH5SoKcFeKn5',
          genesisHash: null,
          isHidden: false,
          name: 'acc1',
          parentAddress: '5Ggap6soAPaP5UeNaiJsgqQwdVhhNnm6ez7Ba1w9jJ62LM2Q',
          suri: '//0',
          whenCreated: 1602001346486
        },
        id: '1607347015530.2',
        request: {
          payload: {
            address: '5D4bqjQRPgdMBK8bNvhX4tSuCtSGZS7rZjD5XH5SoKcFeKn5',
            encrypted
          },
          decrypt: jest.fn()
        },
        url: 'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/accounts'
      },
      {
        account: {
          address: '5Ggap6soAPaP5UeNaiJsgqQwdVhhNnm6ez7Ba1w9jJ62LM2Q',
          genesisHash: null,
          isHidden: false,
          name: 'acc 2',
          suri: '//0',
          whenCreated: 1602001346486
        },
        id: '1607356155395.3',
        request: {
          payload: {
            address: '5Ggap6soAPaP5UeNaiJsgqQwdVhhNnm6ez7Ba1w9jJ62LM2Q',
            encrypted
          },
          decrypt: jest.fn()
        },
        url: 'https://polkadot.js.org/apps'
      }
    ];
    onActionStub = jest.fn();
    await mountComponent();
  });

  describe('Switching between requests', () => {
    it('initially first request should be shown', () => {
      expect(wrapper.find(TransactionIndex).text()).toBe('1/2');
      expect(wrapper.find(Request).prop('decryptId')).toBe(decryptRequests[0].id);
    });

    it('only the right arrow should be active on first screen', async () => {
      expect(wrapper.find('FontAwesomeIcon.arrowLeft')).toHaveLength(1);
      expect(wrapper.find('FontAwesomeIcon.arrowLeft.active')).toHaveLength(0);
      expect(wrapper.find('FontAwesomeIcon.arrowRight.active')).toHaveLength(1);
      wrapper.find('FontAwesomeIcon.arrowLeft').simulate('click');
      await act(flushAllPromises);

      expect(wrapper.find(TransactionIndex).text()).toBe('1/2');
    });

    it('should display second request after clicking right arrow', async () => {
      wrapper.find('FontAwesomeIcon.arrowRight').simulate('click');
      await act(flushAllPromises);

      expect(wrapper.find(TransactionIndex).text()).toBe('2/2');
      expect(wrapper.find(Request).prop('decryptId')).toBe(decryptRequests[1].id);
    });

    it('only the left should be active on second screen', async () => {
      wrapper.find('FontAwesomeIcon.arrowRight').simulate('click');
      await act(flushAllPromises);

      expect(wrapper.find('FontAwesomeIcon.arrowLeft.active')).toHaveLength(1);
      expect(wrapper.find('FontAwesomeIcon.arrowRight')).toHaveLength(1);
      expect(wrapper.find('FontAwesomeIcon.arrowRight.active')).toHaveLength(0);
      expect(wrapper.find(TransactionIndex).text()).toBe('2/2');
    });

    it('should display previous request after the left arrow has been clicked', async () => {
      wrapper.find('FontAwesomeIcon.arrowRight').simulate('click');
      await act(flushAllPromises);
      wrapper.find('FontAwesomeIcon.arrowLeft').simulate('click');
      await act(flushAllPromises);

      expect(wrapper.find(TransactionIndex).text()).toBe('1/2');
      expect(wrapper.find(Request).prop('decryptId')).toBe(decryptRequests[0].id);
    });
  });

  describe('Request rendering', () => {
    it('correctly displays request 1', () => {
      expect(wrapper.find(Address).find('.fullAddress').text()).toBe(decryptRequests[0].account.address);
      expect(wrapper.find(Bytes).find('td.data').map((el): string => el.text())).toEqual([
        'https://polkadot.js.org/apps/?rpc=wss%3A%2F%2Fwestend-rpc.polkadot.io#/accounts',
        encrypted
      ]);
    });

    it('correctly displays request 2', async () => {
      wrapper.find('FontAwesomeIcon.arrowRight').simulate('click');
      await act(flushAllPromises);

      expect(wrapper.find(Address).find('.fullAddress').text()).toBe(decryptRequests[1].account.address);
      expect(wrapper.find(Bytes).find('td.data').map((el): string => el.text())).toEqual([
        'https://polkadot.js.org/apps',
        encrypted
      ]);
    });
  });

  describe('Submitting', () => {
    it('passes request id to cancel call', async () => {
      wrapper.find('.cancelButton').find('a').simulate('click');
      await act(flushAllPromises);

      expect(messaging.cancelDecryptRequest).toBeCalledWith(decryptRequests[0].id);
    });

    it('passes request id and password to approve call', async () => {
      wrapper.find(Input).simulate('change', { target: { value: 'hunter1' } });
      await act(flushAllPromises);

      wrapper.find(Button).find('button').simulate('click');
      await act(flushAllPromises);
      wrapper.update();

      expect(messaging.approveDecryptPassword).toBeCalledWith(decryptRequests[0].id, false, 'hunter1');
    });

    it('asks the background to cache the password when the relevant checkbox is checked', async () => {
      check(wrapper.find('input[type="checkbox"]'));
      await act(flushAllPromises);

      wrapper.find(Input).simulate('change', { target: { value: 'hunter1' } });
      await act(flushAllPromises);

      wrapper.find(Button).find('button').simulate('click');
      await act(flushAllPromises);
      wrapper.update();

      expect(messaging.approveDecryptPassword).toBeCalledWith(decryptRequests[0].id, true, 'hunter1');
    });

    it('shows an error when the password is wrong', async () => {
      // silencing the following expected console.error
      console.error = jest.fn();
      // eslint-disable-next-line @typescript-eslint/require-await
      jest.spyOn(messaging, 'approveDecryptPassword').mockImplementation(async () => {
        throw new Error('Unable to decode using the supplied passphrase');
      });

      wrapper.find(Input).simulate('change', { target: { value: 'anything' } });
      await act(flushAllPromises);

      wrapper.find(Button).find('button').simulate('click');
      await act(flushAllPromises);
      wrapper.update();

      expect(wrapper.find('.warning-message').first().text()).toBe('Unable to decode using the supplied passphrase');
    });

    it('when last request has been removed/cancelled, shows the previous one', async () => {
      wrapper.find('FontAwesomeIcon.arrowRight').simulate('click');
      await act(flushAllPromises);

      act(() => {
        emitter.emit('request', [decryptRequests[0]]);
      });
      await act(flushAllPromises);
      wrapper.update();

      expect(wrapper.find(TransactionIndex)).toHaveLength(0);
      expect(wrapper.find(Request).prop('decryptId')).toBe(decryptRequests[0].id);
    });
  });
});
