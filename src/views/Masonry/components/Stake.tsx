import React, { useMemo } from 'react';
import styled from 'styled-components';

import { Box, Button, CardContent, Typography } from '@material-ui/core';

// import Button from '../../../components/Button';
import Card from '../../../components/Card';
// import CardContent from '../../../components/CardContent';
// import CardIcon from '../../../components/CardIcon';
import { AddIcon, RemoveIcon } from '../../../components/icons';
import IconButton from '../../../components/IconButton';
import Label from '../../../components/Label';
import Value from '../../../components/Value';

import useApprove, { ApprovalState } from '../../../hooks/useApprove';
import useModal from '../../../hooks/useModal';
import useTokenBalance from '../../../hooks/useTokenBalance';
import useWithdrawCheck from '../../../hooks/masonry/useWithdrawCheck';

import { getDisplayBalance } from '../../../utils/formatBalance';

import DepositModal from './DepositModal';
import WithdrawModal from './WithdrawModal';
import useTombFinance from '../../../hooks/useTombFinance';
import ProgressCountdown from './../components/ProgressCountdown';
import useStakedBalanceOnMasonry from '../../../hooks/useStakedBalanceOnMasonry';
import useStakedTokenPriceInDollars from '../../../hooks/useStakedTokenPriceInDollars';
import useUnstakeTimerMasonry from '../../../hooks/masonry/useUnstakeTimerMasonry';
import TokenSymbol from '../../../components/TokenSymbol';
import useStakeToMasonry from '../../../hooks/useStakeToMasonry';
import useWithdrawFromMasonry from '../../../hooks/useWithdrawFromMasonry';

const Stake: React.FC = () => {
  const tombFinance = useTombFinance();
  const [approveStatus, approve] = useApprove(tombFinance.TSHARE, tombFinance.contracts.Masonry.address);

  const tokenBalance = useTokenBalance(tombFinance.TSHARE);
  const stakedBalance = useStakedBalanceOnMasonry();
  const { from, to } = useUnstakeTimerMasonry();

  const stakedTokenPriceInDollars = useStakedTokenPriceInDollars('HSHARE', tombFinance.TSHARE);
  const tokenPriceInDollars = useMemo(
    () =>
      stakedTokenPriceInDollars
        ? (Number(stakedTokenPriceInDollars) * Number(getDisplayBalance(stakedBalance))).toFixed(2).toString()
        : null,
    [stakedTokenPriceInDollars, stakedBalance],
  );
  // const isOldBoardroomMember = boardroomVersion !== 'latest';

  const { onStake } = useStakeToMasonry();
  const { onWithdraw } = useWithdrawFromMasonry();
  const canWithdrawFromMasonry = useWithdrawCheck();

  const [onPresentDeposit, onDismissDeposit] = useModal(
    <DepositModal
      max={tokenBalance}
      onConfirm={(value) => {
        onStake(value);
        onDismissDeposit();
      }}
      tokenName={'SNOSHARE'}
    />,
  );

  const [onPresentWithdraw, onDismissWithdraw] = useModal(
    <WithdrawModal
      max={stakedBalance}
      onConfirm={(value) => {
        onWithdraw(value);
        onDismissWithdraw();
      }}
      tokenName={'SNOSHARE'}
    />,
  );

  return (
    <Box>
      <Card>
        <CardContent>
          <StyledCardContentInner>
            <StyledCardHeader>
                <TokenSymbol symbol="HSHARE" />
              <Value value={getDisplayBalance(stakedBalance)} />
              <Label text={`≈ $${tokenPriceInDollars}`} />
              <Label text={'SNOSHARE Staked'} />
            </StyledCardHeader>
            <StyledCardActions>
              {approveStatus !== ApprovalState.APPROVED ? (
                <Button
                  disabled={approveStatus !== ApprovalState.NOT_APPROVED}
                  variant="contained"
                  color="primary"
                  style={{ marginTop: '65px' }}
                  onClick={approve}
                >
                  Approve SNOSHARE
                </Button>
              ) : (
                <>
                <StyledCardActions2>
                  <IconButton disabled={!canWithdrawFromMasonry} onClick={onPresentWithdraw}>
                    <RemoveIcon/>
                  </IconButton>
                  <StyledActionSpacer />
                  <IconButton onClick={onPresentDeposit}>
                    <AddIcon />
                  </IconButton>
                  </StyledCardActions2>
                </>
              )}
            </StyledCardActions>
          </StyledCardContentInner>
        </CardContent>
      </Card>
      <Box mt={2} style={{ color: '#FFF' }}>
        {canWithdrawFromMasonry ? (
          ''
        ) : (
          <Card>
            <CardContent>
              <Typography style={{ textAlign: 'center' }}>Withdraw possible in</Typography>
              <ProgressCountdown hideBar={true} base={from} deadline={to} description="Withdraw available in" />
            </CardContent>
          </Card>
        )}
      </Box>
    </Box>
  );
};

const StyledCardHeader = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
`;
const StyledCardActions = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 28px;
  width: 100%;
`;
const StyledCardActions2 = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 48px;
  width: 100%;
`;

const StyledActionSpacer = styled.div`
  height: ${(props) => props.theme.spacing[4]}px;
  width: ${(props) => props.theme.spacing[6]}px;
`;

const StyledCardContentInner = styled.div`
  align-items: center;
  display: flex;
  flex: 1;
  flex-direction: column;
  justify-content: space-between;
`;

export default Stake;
