// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./MetaverseNFT721.sol";
import "@openzeppelin/contracts/access/AccessControlEnumerable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
// import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
// import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";

// contract MetaverseVendingMachine is AccessControlEnumerable, ReentrancyGuard, EIP712 {
contract MetaverseVendingMachine is AccessControlEnumerable, ReentrancyGuard {

  address constant metaverseEOAAddress = 0xAb3cbE5E57e0B2035831DcA8e0Ce8f10F2eFa05D;
  // string private constant SIGNING_DOMAIN = "MetaverseVendingMachine";
  // string private constant SIGNATURE_VERSION = "4";
  MetaverseNFT721 NFTAddress;

  event Purchase(uint256 amount, address smartContractAddress, uint256 tokenId);

  // struct MintNFTVoucher {
  //   uint256 tokenMintLimit;
  //   uint256 price;
  //   address currency; // for native Eth payments, use 'address(0)' as input; for ERC20 payments, specify the ERC20's smart-contract address
  //   address withdrawalAddress;
  //   string uri;
  //   bytes signature;
  // }

  // struct ClaimNFTVoucher {
  //   uint256 tokenId;
  //   address tokenAddress;
  //   address receiver;
  //   bytes signature;
  // }

  // would've been useful to limit the NFT minting to ones with approved URIs 
  //(No Frostmourne minting for 0.2 measly ETHs !)
  // struct VettedURI {
  //   string uri;
  //   bytes signature;
  // }

  // constructor(address _metaverseNFT721) EIP712(SIGNING_DOMAIN, SIGNATURE_VERSION) {
  constructor(address _metaverseNFT721) {
    NFTAddress = MetaverseNFT721(_metaverseNFT721);
    _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
  }

  // Users can query this function to mint items without actual minting rights;
  // instead they pay a small fee and the NFT will appear in the target address

  //function mintNewNFT(address to, VettedURI calldata myUri) payable public {
  function mintNewNFT(address to, string memory myUri) payable public nonReentrant() {
    // require(_verify(myUri) == metaverseEOAAddress);

    require(msg.value >= 0.2 ether, "insufficient funds");
    NFTAddress.safeMint(to, myUri);

    //NFTAddress.safeMint(to, myUri.uri);
  }

  // Users calls this function to signal the Metaverse that they've made a purchase of an item held by this smart contract
  // The item they purchased will drop on the floor shortly after (requires a bit of trust)
  // If the item is not owned by the metaverse's EOA, then the transaction will revert
  function purchaseNFTFromMachine(address smartContractAddress, uint256 tokenId) payable external nonReentrant() {
    require(msg.value >= 0.2 ether);

    IERC721(smartContractAddress).transferFrom(address(this), metaverseEOAAddress, tokenId);
    // making sure it clears up
    require(IERC721(smartContractAddress).ownerOf(tokenId) == metaverseEOAAddress, "NFT Transfer failed");
    
    emit Purchase(msg.value, smartContractAddress, tokenId);
  }


  // Emergency feature for items blocked here
  function forceTransferTo(address tokenAddress, uint256 tokenId, address to) public onlyRole(DEFAULT_ADMIN_ROLE) {
    IERC721(tokenAddress).transferFrom(address(this), to, tokenId);
  }

  function withdraw(address payable to) public onlyRole(DEFAULT_ADMIN_ROLE) {
    to.transfer(address(this).balance);
  }

  // Discontinued : on-chain logic for signature verification
  // helps in creating signature-based access control / data sanitizing from trusted parties

  // /** 
  //  * @notice Returns a hash of the given NFTVoucher, prepared using EIP712 typed data hashing rules.
  //  * @dev This function is used by 'verify()' in order to retrieve the address of the voucher's signer.
  //  * @param voucher An NFTVoucher to hash.
  //  * @return hash the hash of the NFTVoucher in bytes32 format.
  //  */
  // function _hash(MintNFTVoucher calldata voucher) internal view returns (bytes32) {
  //   return
  //     _hashTypedDataV4(
  //       keccak256(
  //         abi.encode(
  //           keccak256(
  //             "NFTVoucher(uint256 tokenMintLimit,uint256 price,address currency,address withdrawalAddress,string uri)"
  //           ),
  //           voucher.tokenMintLimit,
  //           keccak256(bytes(voucher.uri)),
  //           voucher.price,
  //           voucher.currency,
  //           voucher.withdrawalAddress
  //         )
  //       )
  //     );
  // }

  // /**
  //  * @notice Verifies the signature for a given NFTVoucher, returning the address of the signer. Signature is based on the EIP712 standard.
  //  * @dev Will revert if the signature is invalid. Does not verify that the signer is authorized to mint NFTs.
  //  * @param voucher An NFTVoucher describing the auction you're curious about.
  //  * @return signer the address of the guy who signed that NFT.
  //  */
  // function verify(MintNFTVoucher calldata voucher)
  //   public
  //   view
  //   returns (address)
  // {
  //   bytes32 digest = _hash(voucher);
  //   return ECDSA.recover(digest, voucher.signature);
  // }

  // /**
  //  * @notice returns the voucher's signer address. Signature is based on the EIP712 standard.
  //  * @dev similar to 'verify()', which is also a public function doing exactly the same thing.
  //  * Will revert if the signature is invalid. Does not verify that the signer is authorized to mint NFTs.
  //  * @param voucher An NFTVoucher describing the auction you're curious about.
  //  * @return signer the address of the guy who signed that NFT.
  //  */
  // function getVoucherSigner(MintNFTVoucher calldata voucher)
  //   public
  //   view
  //   returns (address signer)
  // {
  //   signer = verify(voucher);
  // }
}