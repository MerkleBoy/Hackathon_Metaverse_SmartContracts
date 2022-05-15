/* eslint-disable node/no-unsupported-features/es-syntax */
/* eslint-disable node/no-unpublished-import */
// import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Contract, BigNumber } from "ethers";

// These constants must match the ones used in the smart contract.
const SIGNING_DOMAIN_NAME = "MetaverseWalletNFT";
const SIGNING_DOMAIN_VERSION = "4";

interface Vetter {
  contract: any;
  signer: any;
}

/**
 * JSDoc typedefs.
 *
 * @typedef {object} VettedURI
 * @property {string} uri the metadata URI to associate with this NFT
 * @property {ethers.BytesLike} signature an EIP-712 signature of all fields in the NFTVoucher, apart from signature itself.
 */

/**
 * LazyVetter is a helper class that creates NFTVoucher objects and signs them, to be redeemed later by the LazyNFT contract.
 */
export default class LazyVetter {
  contract: Contract;
  signer: SignerWithAddress;
  _domain: any;

  /**
   * Create a new LazyVetter targeting a deployed instance of the MetaverseWallet contract.
   *
   * @param {Object} options
   * @param {ethers.Contract} contract an ethers Contract that's wired up to the deployed contract
   * @param {ethers.Signer} signer a Signer whose account is authorized to vet URIs on the deployed contract
   */
  constructor({ contract, signer }: Vetter) {
    this.contract = contract;
    this.signer = signer;
  }

  /**
   * Creates a new NFTVoucher object and signs it using this LazyMinter's signing key.
   *
   * @param {string} uri the metadata URI to associate with the soon-to-be created NFT
   * @param {ethers.BytesLike} signature an EIP-712 signature of all fields in the NFTVoucher, apart from signature itself.
   *
   * @returns {VettedURI}
   */
  async createVoucher(
    uri: string
  ) {
    const voucher = {
      uri
    };
    const domain = await this._signingDomain();
    const types = {
      NFTVoucher: [
        { name: "uri", type: "string" }
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
