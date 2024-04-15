import { PUBLISHED_AT } from "..";
import {
  GenericArg,
  ObjectArg,
  generic,
  obj,
  pure,
} from "../../_framework/util";
import {
  TransactionArgument,
  TransactionBlock,
} from "@mysten/sui.js/transactions";

export interface SetArgs {
  builder: ObjectArg;
  field: GenericArg;
  value: GenericArg;
}

export function set(
  txb: TransactionBlock,
  typeArgs: [string, string],
  args: SetArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set`,
    typeArguments: typeArgs,
    arguments: [
      obj(txb, args.builder),
      generic(txb, `${typeArgs[0]}`, args.field),
      generic(txb, `${typeArgs[1]}`, args.value),
    ],
  });
}

export function destroy(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::destroy`,
    arguments: [obj(txb, config)],
  });
}

export function from(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::from`,
    arguments: [obj(txb, config)],
  });
}

export function borrowFee(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::borrow_fee`,
    arguments: [obj(txb, config)],
  });
}

export function borrowLimit(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::borrow_limit`,
    arguments: [obj(txb, config)],
  });
}

export function borrowLimitUsd(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::borrow_limit_usd`,
    arguments: [obj(txb, config)],
  });
}

export function borrowWeight(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::borrow_weight`,
    arguments: [obj(txb, config)],
  });
}

export function build(txb: TransactionBlock, builder: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::build`,
    arguments: [obj(txb, builder)],
  });
}

export interface CalculateAprArgs {
  config: ObjectArg;
  curUtil: ObjectArg;
}

export function calculateApr(txb: TransactionBlock, args: CalculateAprArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::calculate_apr`,
    arguments: [obj(txb, args.config), obj(txb, args.curUtil)],
  });
}

export interface CalculateSupplyAprArgs {
  config: ObjectArg;
  curUtil: ObjectArg;
  borrowApr: ObjectArg;
}

export function calculateSupplyApr(
  txb: TransactionBlock,
  args: CalculateSupplyAprArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::calculate_supply_apr`,
    arguments: [
      obj(txb, args.config),
      obj(txb, args.curUtil),
      obj(txb, args.borrowApr),
    ],
  });
}

export function closeLtv(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::close_ltv`,
    arguments: [obj(txb, config)],
  });
}

export interface CreateReserveConfigArgs {
  openLtvPct: number | TransactionArgument;
  closeLtvPct: number | TransactionArgument;
  maxCloseLtvPct: number | TransactionArgument;
  borrowWeightBps: bigint | TransactionArgument;
  depositLimit: bigint | TransactionArgument;
  borrowLimit: bigint | TransactionArgument;
  liquidationBonusBps: bigint | TransactionArgument;
  maxLiquidationBonusBps: bigint | TransactionArgument;
  depositLimitUsd: bigint | TransactionArgument;
  borrowLimitUsd: bigint | TransactionArgument;
  borrowFeeBps: bigint | TransactionArgument;
  spreadFeeBps: bigint | TransactionArgument;
  protocolLiquidationFeeBps: bigint | TransactionArgument;
  interestRateUtils: Array<number | TransactionArgument> | TransactionArgument;
  interestRateAprs: Array<bigint | TransactionArgument> | TransactionArgument;
  isolated: boolean | TransactionArgument;
  openAttributedBorrowLimitUsd: bigint | TransactionArgument;
  closeAttributedBorrowLimitUsd: bigint | TransactionArgument;
}

export function createReserveConfig(
  txb: TransactionBlock,
  args: CreateReserveConfigArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::create_reserve_config`,
    arguments: [
      pure(txb, args.openLtvPct, `u8`),
      pure(txb, args.closeLtvPct, `u8`),
      pure(txb, args.maxCloseLtvPct, `u8`),
      pure(txb, args.borrowWeightBps, `u64`),
      pure(txb, args.depositLimit, `u64`),
      pure(txb, args.borrowLimit, `u64`),
      pure(txb, args.liquidationBonusBps, `u64`),
      pure(txb, args.maxLiquidationBonusBps, `u64`),
      pure(txb, args.depositLimitUsd, `u64`),
      pure(txb, args.borrowLimitUsd, `u64`),
      pure(txb, args.borrowFeeBps, `u64`),
      pure(txb, args.spreadFeeBps, `u64`),
      pure(txb, args.protocolLiquidationFeeBps, `u64`),
      pure(txb, args.interestRateUtils, `vector<u8>`),
      pure(txb, args.interestRateAprs, `vector<u64>`),
      pure(txb, args.isolated, `bool`),
      pure(txb, args.openAttributedBorrowLimitUsd, `u64`),
      pure(txb, args.closeAttributedBorrowLimitUsd, `u64`),
    ],
  });
}

export function depositLimit(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::deposit_limit`,
    arguments: [obj(txb, config)],
  });
}

export function depositLimitUsd(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::deposit_limit_usd`,
    arguments: [obj(txb, config)],
  });
}

export function isolated(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::isolated`,
    arguments: [obj(txb, config)],
  });
}

export function liquidationBonus(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::liquidation_bonus`,
    arguments: [obj(txb, config)],
  });
}

export function openLtv(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::open_ltv`,
    arguments: [obj(txb, config)],
  });
}

export function protocolLiquidationFee(
  txb: TransactionBlock,
  config: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::protocol_liquidation_fee`,
    arguments: [obj(txb, config)],
  });
}

export interface SetBorrowFeeBpsArgs {
  builder: ObjectArg;
  borrowFeeBps: bigint | TransactionArgument;
}

export function setBorrowFeeBps(
  txb: TransactionBlock,
  args: SetBorrowFeeBpsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_borrow_fee_bps`,
    arguments: [obj(txb, args.builder), pure(txb, args.borrowFeeBps, `u64`)],
  });
}

export interface SetBorrowLimitArgs {
  builder: ObjectArg;
  borrowLimit: bigint | TransactionArgument;
}

export function setBorrowLimit(
  txb: TransactionBlock,
  args: SetBorrowLimitArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_borrow_limit`,
    arguments: [obj(txb, args.builder), pure(txb, args.borrowLimit, `u64`)],
  });
}

export interface SetBorrowLimitUsdArgs {
  builder: ObjectArg;
  borrowLimitUsd: bigint | TransactionArgument;
}

export function setBorrowLimitUsd(
  txb: TransactionBlock,
  args: SetBorrowLimitUsdArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_borrow_limit_usd`,
    arguments: [obj(txb, args.builder), pure(txb, args.borrowLimitUsd, `u64`)],
  });
}

export interface SetBorrowWeightBpsArgs {
  builder: ObjectArg;
  borrowWeightBps: bigint | TransactionArgument;
}

export function setBorrowWeightBps(
  txb: TransactionBlock,
  args: SetBorrowWeightBpsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_borrow_weight_bps`,
    arguments: [obj(txb, args.builder), pure(txb, args.borrowWeightBps, `u64`)],
  });
}

export interface SetCloseAttributedBorrowLimitUsdArgs {
  builder: ObjectArg;
  closeAttributedBorrowLimitUsd: bigint | TransactionArgument;
}

export function setCloseAttributedBorrowLimitUsd(
  txb: TransactionBlock,
  args: SetCloseAttributedBorrowLimitUsdArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_close_attributed_borrow_limit_usd`,
    arguments: [
      obj(txb, args.builder),
      pure(txb, args.closeAttributedBorrowLimitUsd, `u64`),
    ],
  });
}

export interface SetCloseLtvPctArgs {
  builder: ObjectArg;
  closeLtvPct: number | TransactionArgument;
}

export function setCloseLtvPct(
  txb: TransactionBlock,
  args: SetCloseLtvPctArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_close_ltv_pct`,
    arguments: [obj(txb, args.builder), pure(txb, args.closeLtvPct, `u8`)],
  });
}

export interface SetDepositLimitArgs {
  builder: ObjectArg;
  depositLimit: bigint | TransactionArgument;
}

export function setDepositLimit(
  txb: TransactionBlock,
  args: SetDepositLimitArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_deposit_limit`,
    arguments: [obj(txb, args.builder), pure(txb, args.depositLimit, `u64`)],
  });
}

export interface SetDepositLimitUsdArgs {
  builder: ObjectArg;
  depositLimitUsd: bigint | TransactionArgument;
}

export function setDepositLimitUsd(
  txb: TransactionBlock,
  args: SetDepositLimitUsdArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_deposit_limit_usd`,
    arguments: [obj(txb, args.builder), pure(txb, args.depositLimitUsd, `u64`)],
  });
}

export interface SetInterestRateAprsArgs {
  builder: ObjectArg;
  interestRateAprs: Array<bigint | TransactionArgument> | TransactionArgument;
}

export function setInterestRateAprs(
  txb: TransactionBlock,
  args: SetInterestRateAprsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_interest_rate_aprs`,
    arguments: [
      obj(txb, args.builder),
      pure(txb, args.interestRateAprs, `vector<u64>`),
    ],
  });
}

export interface SetInterestRateUtilsArgs {
  builder: ObjectArg;
  interestRateUtils: Array<number | TransactionArgument> | TransactionArgument;
}

export function setInterestRateUtils(
  txb: TransactionBlock,
  args: SetInterestRateUtilsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_interest_rate_utils`,
    arguments: [
      obj(txb, args.builder),
      pure(txb, args.interestRateUtils, `vector<u8>`),
    ],
  });
}

export interface SetIsolatedArgs {
  builder: ObjectArg;
  isolated: boolean | TransactionArgument;
}

export function setIsolated(txb: TransactionBlock, args: SetIsolatedArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_isolated`,
    arguments: [obj(txb, args.builder), pure(txb, args.isolated, `bool`)],
  });
}

export interface SetLiquidationBonusBpsArgs {
  builder: ObjectArg;
  liquidationBonusBps: bigint | TransactionArgument;
}

export function setLiquidationBonusBps(
  txb: TransactionBlock,
  args: SetLiquidationBonusBpsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_liquidation_bonus_bps`,
    arguments: [
      obj(txb, args.builder),
      pure(txb, args.liquidationBonusBps, `u64`),
    ],
  });
}

export interface SetMaxCloseLtvPctArgs {
  builder: ObjectArg;
  maxCloseLtvPct: number | TransactionArgument;
}

export function setMaxCloseLtvPct(
  txb: TransactionBlock,
  args: SetMaxCloseLtvPctArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_max_close_ltv_pct`,
    arguments: [obj(txb, args.builder), pure(txb, args.maxCloseLtvPct, `u8`)],
  });
}

export interface SetMaxLiquidationBonusBpsArgs {
  builder: ObjectArg;
  maxLiquidationBonusBps: bigint | TransactionArgument;
}

export function setMaxLiquidationBonusBps(
  txb: TransactionBlock,
  args: SetMaxLiquidationBonusBpsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_max_liquidation_bonus_bps`,
    arguments: [
      obj(txb, args.builder),
      pure(txb, args.maxLiquidationBonusBps, `u64`),
    ],
  });
}

export interface SetOpenAttributedBorrowLimitUsdArgs {
  builder: ObjectArg;
  openAttributedBorrowLimitUsd: bigint | TransactionArgument;
}

export function setOpenAttributedBorrowLimitUsd(
  txb: TransactionBlock,
  args: SetOpenAttributedBorrowLimitUsdArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_open_attributed_borrow_limit_usd`,
    arguments: [
      obj(txb, args.builder),
      pure(txb, args.openAttributedBorrowLimitUsd, `u64`),
    ],
  });
}

export interface SetOpenLtvPctArgs {
  builder: ObjectArg;
  openLtvPct: number | TransactionArgument;
}

export function setOpenLtvPct(txb: TransactionBlock, args: SetOpenLtvPctArgs) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_open_ltv_pct`,
    arguments: [obj(txb, args.builder), pure(txb, args.openLtvPct, `u8`)],
  });
}

export interface SetProtocolLiquidationFeeBpsArgs {
  builder: ObjectArg;
  protocolLiquidationFeeBps: bigint | TransactionArgument;
}

export function setProtocolLiquidationFeeBps(
  txb: TransactionBlock,
  args: SetProtocolLiquidationFeeBpsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_protocol_liquidation_fee_bps`,
    arguments: [
      obj(txb, args.builder),
      pure(txb, args.protocolLiquidationFeeBps, `u64`),
    ],
  });
}

export interface SetSpreadFeeBpsArgs {
  builder: ObjectArg;
  spreadFeeBps: bigint | TransactionArgument;
}

export function setSpreadFeeBps(
  txb: TransactionBlock,
  args: SetSpreadFeeBpsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::set_spread_fee_bps`,
    arguments: [obj(txb, args.builder), pure(txb, args.spreadFeeBps, `u64`)],
  });
}

export function spreadFee(txb: TransactionBlock, config: ObjectArg) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::spread_fee`,
    arguments: [obj(txb, config)],
  });
}

export function validateReserveConfig(
  txb: TransactionBlock,
  config: ObjectArg,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::validate_reserve_config`,
    arguments: [obj(txb, config)],
  });
}

export interface ValidateUtilsAndAprsArgs {
  utils: Array<number | TransactionArgument> | TransactionArgument;
  aprs: Array<bigint | TransactionArgument> | TransactionArgument;
}

export function validateUtilsAndAprs(
  txb: TransactionBlock,
  args: ValidateUtilsAndAprsArgs,
) {
  return txb.moveCall({
    target: `${PUBLISHED_AT}::reserve_config::validate_utils_and_aprs`,
    arguments: [
      pure(txb, args.utils, `vector<u8>`),
      pure(txb, args.aprs, `vector<u64>`),
    ],
  });
}
