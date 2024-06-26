import type { AssetConditionGroup } from 'blockin';
import type { NumberType } from 'blockin/dist/types/verify.types';
import styled from 'styled-components';

import {
  ConnectButton,
  InstallFlaskButton,
  ReconnectButton,
  SendHelloButton,
  Card,
} from '../components';
import { defaultSnapOrigin } from '../config';
import {
  useMetaMask,
  useInvokeSnap,
  useMetaMaskContext,
  useRequestSnap,
  useRequest,
} from '../hooks';
import { isLocalSnap, shouldDisplayReconnectButton } from '../utils';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  flex: 1;
  margin-top: 7.6rem;
  margin-bottom: 7.6rem;
  ${({ theme }) => theme.mediaQueries.small} {
    padding-left: 2.4rem;
    padding-right: 2.4rem;
    margin-top: 2rem;
    margin-bottom: 2rem;
    width: auto;
  }
`;

const Heading = styled.h1`
  margin-top: 0;
  margin-bottom: 2.4rem;
  text-align: center;
`;

const Span = styled.span`
  color: ${(props) => props.theme.colors.primary?.default};
`;

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.large};
  font-weight: 500;
  margin-top: 0;
  margin-bottom: 0;
  ${({ theme }) => theme.mediaQueries.small} {
    font-size: ${({ theme }) => theme.fontSizes.text};
  }
`;

const CardContainer = styled.div`
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  justify-content: space-between;
  max-width: 64.8rem;
  width: 100%;
  height: 100%;
  margin-top: 1.5rem;
`;

const Notice = styled.div`
  background-color: ${({ theme }) => theme.colors.background?.alternative};
  border: 1px solid ${({ theme }) => theme.colors.border?.default};
  color: ${({ theme }) => theme.colors.text?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;

  & > * {
    margin: 0;
  }
  ${({ theme }) => theme.mediaQueries.small} {
    margin-top: 1.2rem;
    padding: 1.6rem;
  }
`;

const ErrorMessage = styled.div`
  background-color: ${({ theme }) => theme.colors.error?.muted};
  border: 1px solid ${({ theme }) => theme.colors.error?.default};
  color: ${({ theme }) => theme.colors.error?.alternative};
  border-radius: ${({ theme }) => theme.radii.default};
  padding: 2.4rem;
  margin-bottom: 2.4rem;
  margin-top: 2.4rem;
  max-width: 60rem;
  width: 100%;
  ${({ theme }) => theme.mediaQueries.small} {
    padding: 1.6rem;
    margin-bottom: 1.2rem;
    margin-top: 1.2rem;
    max-width: 100%;
  }
`;

type ExpectedBalanceItem = {
  label: string;
  assetOwnershipRequirements: AssetConditionGroup<NumberType>;
};

const Index = () => {
  const { error } = useMetaMaskContext();
  const { isFlask, snapsDetected, installedSnap } = useMetaMask();
  const requestSnap = useRequestSnap();
  const invokeSnap = useInvokeSnap();
  const request = useRequest();

  const isMetaMaskReady = isLocalSnap(defaultSnapOrigin)
    ? isFlask
    : snapsDetected;

  const handleSendHelloClick = async () => {
    await invokeSnap({ method: 'hello' });
  };

  const handleTransaction = async () => {
    const accounts = (await request({
      method: 'eth_requestAccounts',
    })) as string[];
    if (accounts.length > 0) {
      await request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: accounts[0],
            to: '0x1368D87519A1e491a370e47DE0db4E78282BE35e',
          },
        ],
      });
    }
  };

  const handleExpectedBalances = async () => {
    // Persist some data.
    await invokeSnap({
      method: 'set_expected',
      params: {
        expectedBalances: [
          {
            label: 'BitBadges Beta',
            assetOwnershipRequirements: {
              $and: [
                {
                  assets: [
                    {
                      collectionId: '2',
                      assetIds: [{ start: 1, end: 1 }],
                      chain: 'BitBadges',
                      mustOwnAmounts: { start: 1, end: 1 },
                      ownershipTimes: [],
                    },
                  ],
                },
              ],
            },
          },
        ] as ExpectedBalanceItem[],
      },
    });

    // // At a later time, get the stored data.
    // const persistedData = await snap.request({
    //   method: 'snap_manageState',
    //   params: { operation: 'get' },
    // });

    // console.log(persistedData);
    // // { hello: "world" }

    // // If data storage is no longer necessary, clear it.
    // await snap.request({
    //   method: 'snap_manageState',
    //   params: {
    //     operation: 'clear',
    //   },
    // });
  };

  const handleSignatures = async () => {
    const accounts = (await request({
      method: 'eth_requestAccounts',
    })) as string[];

    if (accounts.length === 0) {
      return;
    }

    await request({
      method: 'eth_sign',
      params: [accounts[0], '0xdeadbeef'],
    });
  };

  return (
    <Container>
      <Heading>
        Welcome to <Span>template-snap</Span>
      </Heading>
      <Subtitle>
        Get started by editing <code>src/index.ts</code>
      </Subtitle>
      <CardContainer>
        {error && (
          <ErrorMessage>
            <b>An error happened:</b> {error.message}
          </ErrorMessage>
        )}
        {!isMetaMaskReady && (
          <Card
            content={{
              title: 'Install',
              description:
                'Snaps is pre-release software only available in MetaMask Flask, a canary distribution for developers with access to upcoming features.',
              button: <InstallFlaskButton />,
            }}
            fullWidth
          />
        )}
        {!installedSnap && (
          <Card
            content={{
              title: 'Connect',
              description:
                'Get started by connecting to and installing the example snap.',
              button: (
                <ConnectButton
                  onClick={requestSnap}
                  disabled={!isMetaMaskReady}
                />
              ),
            }}
            disabled={!isMetaMaskReady}
          />
        )}
        {shouldDisplayReconnectButton(installedSnap) && (
          <Card
            content={{
              title: 'Reconnect',
              description:
                'While connected to a local running snap this button will always be displayed in order to update the snap if a change is made.',
              button: (
                <ReconnectButton
                  onClick={requestSnap}
                  disabled={!installedSnap}
                />
              ),
            }}
            disabled={!installedSnap}
          />
        )}
        <Card
          content={{
            title: 'Send Hello message',
            description:
              'Display a custom message within a confirmation screen in MetaMask.',
            button: (
              <SendHelloButton
                onClick={handleSendHelloClick}
                disabled={!installedSnap}
              />
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Send Transaction',
            description:
              'Send a transaction to the blockchain to trigger a transaction insight.',
            button: (
              <button
                onClick={() => {
                  handleTransaction().catch(console.error);
                }}
              >
                Send Transaction
              </button>
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Sign Message',
            description: 'Sign a message to trigger a message insight.',
            button: (
              <button
                onClick={() => {
                  handleSignatures().catch(console.error);
                }}
              >
                Sign Message
              </button>
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Card
          content={{
            title: 'Set Expected Balances',
            description: '',
            button: (
              <button
                onClick={() => {
                  handleExpectedBalances().catch(console.error);
                }}
              >
                Set Expected Balances
              </button>
            ),
          }}
          disabled={!installedSnap}
          fullWidth={
            isMetaMaskReady &&
            Boolean(installedSnap) &&
            !shouldDisplayReconnectButton(installedSnap)
          }
        />
        <Notice>
          <p>
            Please note that the <b>snap.manifest.json</b> and{' '}
            <b>package.json</b> must be located in the server root directory and
            the bundle must be hosted at the location specified by the location
            field.
          </p>
        </Notice>
      </CardContainer>
    </Container>
  );
};

export default Index;
