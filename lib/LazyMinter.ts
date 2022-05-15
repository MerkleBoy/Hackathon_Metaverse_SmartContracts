/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable node/no-unpublished-import */
// import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, BigNumber } from "ethers";

// These constants must match the ones used in the smart contract.
const SIGNING_DOMAIN_NAME = "MetaverseNFT";
const SIGNING_DOMAIN_VERSION = "4";

interface Minter {
  contract: any;
  signer: any;
}

/**
 * JSDoc typedefs.
 *
 * @typedef {object} NFTVoucher
 * @property {BigNumber | number} tokenMintLimit the number of tokens that voucher is allowed to mint
 * @property {BigNumber | number} price the price (in wei) that the creator will accept to redeem this NFT a  gainst
 * @property {string} currency the smart-contract address of the currency accepted for payments (0 means native Ether)
 * @property {string} withdrawalAddress the address that will receive the payments (awaiting withdrawal from the MetaverseNFT contract)
 * @property {string} uri the metadata URI to associate with this NFT
 * @property {ethers.BytesLike} signature an EIP-712 signature of all fields in the NFTVoucher, apart from signature itself.
 */

/**
 * LazyMinter is a helper class that creates NFTVoucher objects and signs them, to be redeemed later by the LazyNFT contract.
 */
export default class LazyMinter {
  contract: Contract;
  signer: SignerWithAddress;
  _domain: any;

  /**
   * Create a new LazyMinter targeting a deployed instance of the LazyNFT contract.
   *
   * @param {Object} options
   * @param {ethers.Contract} contract an ethers Contract that's wired up to the deployed contract
   * @param {ethers.Signer} signer a Signer whose account is authorized to mint NFTs on the deployed contract
   */
  constructor({ contract, signer }: Minter) {
    this.contract = contract;
    this.signer = signer;
  }

  /**
   * Creates a new NFTVoucher object and signs it using this LazyMinter's signing key.
   *
   * @param {BigNumber | number} tokenMintLimit the number of tokens that voucher is allowed to mint
   * @param {BigNumber} price the price (in wei) that the creator will accept to redeem this NFT a  gainst
   * @param {string} currency the smart-contract address of the currency accepted for payments (0 means native Ether)
   * @param {string} withdrawalAddress the address that will receive the payments (awaiting withdrawal from the MetaverseNFT contract)
   * @param {string} uri the metadata URI to associate with this NFT
   * @param {ethers.BytesLike} signature an EIP-712 signature of all fields in the NFTVoucher, apart from signature itself.
   *
   * @returns {NFTVoucher}
   */
  async createVoucher(
    tokenMintLimit: BigNumber | number,
    price: BigNumber,
    currency: string,
    withdrawalAddress: string,
    uri: string
  ) {
    const voucher = {
      tokenMintLimit,
      uri,
      price,
      currency,
      withdrawalAddress,
    };
    const domain = await this._signingDomain();
    const types = {
      NFTVoucher: [
        { name: "tokenMintLimit", type: "uint256" },
        { name: "uri", type: "string" },
        { name: "price", type: "uint256" },
        { name: "currency", type: "address" },
        { name: "withdrawalAddress", type: "address" },
      ],
    };
    const signature = await this.signer._signTypedData(domain, types, voucher);
    return {
      ...voucher,
      signature,
    };
  }

  /**
   * @private
   * @returns {object} the EIP-712 signing domain, tied to the chainId of the signer
   */
  async _signingDomain() {
    if (this._domain != null) {
      return this._domain;
    }
    const chainId = await this.contract.getChainID();
    this._domain = {
      name: SIGNING_DOMAIN_NAME,
      version: SIGNING_DOMAIN_VERSION,
      verifyingContract: this.contract.address,
      chainId,
    };
    return this._domain;
  }
}
