const GangPass = artifacts.require('GangPass');
const web3 = require('web3');
const truffleAssert = require('truffle-assertions');

contract('GangPass', accounts => {
    before(async() => {
        gang = await GangPass.deployed();
        owner = await accounts[0];
        user = await accounts[1];
    });

    it('should deploy smart contract properly', async() => {
        console.log('Contract address:', gang.address);
        assert(gang.address !== '');
    });

    /* ******************* OWNER FUNCTIONS ******************* */

    it('should setUri properly', async() => {
        const newUri = "ananaananana";

        await gang.setURI(newUri);
        assert.equal(await gang.uri(1), newUri, "Expected to be newURI");
    });

    it('should setWhitelistSigner properly', async() => {
        const newSigner = user;

        await gang.setWhitelistSigner(newSigner);
        assert.equal(await gang.whitelistSigner.call(), newSigner, 'Expected to be newSigner');
    });

    it('should setSaleState properly', async() => {
        await gang.setSaleState();
        assert.isTrue(await gang.saleIsActive.call(), 'Expected to be true - sale state');
    });

    it('should setPublicSaleState properly', async() => {
        await gang.setPublicSaleState();
        assert.isTrue(await gang.publicSaleIsActive.call(), 'Expected to be true - public sale state')
    });

    it('should setMaxSupplies properly', async() => {
        const t1 = 10;
        const t2 = 5;
        const t3 = 3;

        await gang.setMaxSupplies(t1, t2, t3);
        assert.equal(await gang.maxSupplies(0), 0, 'Expexted to be zero');
        assert.equal(await gang.maxSupplies(1), t1, 'Expected to be t1');
        assert.equal(await gang.maxSupplies(2), t2, 'Expected to be t2');
        assert.equal(await gang.maxSupplies(3), t3, 'Expected to be t3');
    });

    it('should setPrices properly', async() => {
        const p1 = web3.utils.toWei('0.099', 'ether');
        const p2 = web3.utils.toWei('0.19', 'ether');
        const p3 = web3.utils.toWei('0.29', 'ether');

        await gang.setPrices(p1, p2, p3);
        assert.equal(await gang.prices(0), 0, 'Expected to be zero');
        assert.equal(await gang.prices(1), p1, 'Expected to be p1');
        assert.equal(await gang.prices(2), p2, 'Expected to be p2');
        assert.equal(await gang.prices(3), p3, 'Expected to be p3');
    });

    it('should setProxyRegistryAddress properly', async() => {
        const newregistryAddress = user;

        await gang.setProxyRegistryAddress(newregistryAddress);
        assert.equal(await gang.proxyRegistryAddress.call(), newregistryAddress, 'Expected to be newRegistryAddress');
    });

    it('should not publicMint if ETH is not enough', async() => {
        await truffleAssert.reverts(
            gang.publicMint(1, {from: user, value: web3.utils.toWei('0.098', 'ether')}),
            "Not enough ETH for transaction"
        );

        await truffleAssert.reverts(
            gang.publicMint(2, {from: user, value: web3.utils.toWei('0.18', 'ether')}),
            "Not enough ETH for transaction"
        );
    })

    it('should giveAway properly', async() => {
        let reservedTier1 = 30;
        let reservedTier2 = 15;
        let reservedTier3 = 4;

        for(let i = 1; i < 31; i++) {
            await gang.giveAway(accounts[i], 1, {from: owner});
            reservedTier1 = reservedTier1 - 1
            assert.equal(await gang.reservedTiers(1), reservedTier1, 'Expected to be remain t1');
        }

        for(let i = 31; i < 46; i++) {
            await gang.giveAway(accounts[i], 2, {from: owner});
            reservedTier2 = reservedTier2 - 1;
            assert.equal(await gang.reservedTiers(2), reservedTier2, 'Expected to be remain t2')
        }

        for(let i = 46; i < 50; i++) {
            await gang.giveAway(accounts[i], 3, {from:owner});
            reservedTier3 = reservedTier3 - 1;
            assert.equal(await gang.reservedTiers(3), reservedTier3, 'Expected to be remain t3');
        }

        assert.equal(await gang.reservedTiers(0), 0, 'Expected to be zero');
    });

    /* ******************* REVERTS ******************* */

    it('should not execute onlyOwner functions by user', async() => {
        await truffleAssert.reverts(
            gang.setURI("sdlmfldf", {from: user}),
            "Ownable: caller is not the owner"
        );

        await truffleAssert.reverts(
            gang.setWhitelistSigner(user, {from: user}),
            "Ownable: caller is not the owner"
        );

        await truffleAssert.reverts(
            gang.setWhitelistSigner(user, {from: user}),
            "Ownable: caller is not the owner"
        );

        await truffleAssert.reverts(
            gang.setSaleState({from: user}),
            "Ownable: caller is not the owner"
        );

        await truffleAssert.reverts(
            gang.setPublicSaleState({from: user}),
            "Ownable: caller is not the owner"
        );

        await truffleAssert.reverts(
            gang.setMaxSupplies(10, 5, 3, {from: user}),
            "Ownable: caller is not the owner"
        );

        await truffleAssert.reverts(
            gang.setPrices(10, 5, 3, {from: user}),
            "Ownable: caller is not the owner"
        );

        await truffleAssert.reverts(
            gang.setProxyRegistryAddress(user, {from: user}),
            "Ownable: caller is not the owner"
        );

        await truffleAssert.reverts(
            gang.giveAway(user, 1, {from: user}),
            "Ownable: caller is not the owner"
        );
    });

    it('should not giveAway in other tokenId', async() => {
        await truffleAssert.reverts(
            gang.giveAway(owner, 0, {from: owner}),
            "Only Tier1, Tier2 and Tier3"
        );
    });

    it('should not exceed reservedTiers', async() => {
        await truffleAssert.reverts(
            gang.giveAway(owner, 1, {from: owner}),
            "All reserved NFTs for the corresponding tier are minted"
        );

        await truffleAssert.reverts(
            gang.giveAway(owner, 2, {from: owner}),
            "All reserved NFTs for the corresponding tier are minted"
        );

        await truffleAssert.reverts(
            gang.giveAway(owner, 3, {from: owner}),
            "All reserved NFTs for the corresponding tier are minted"
        );
    });

    it('should not mint if publicSaleIsActive is false', async() => {
        await gang.setPublicSaleState({from: owner});

        await truffleAssert.reverts(
            gang.publicMint(1, {from: user}),
            "Sale is not active yet"
        );
    });

    it('should not mint Tier3 in public sale', async() => {
        await gang.setPublicSaleState({from: owner});
        //assert.isTrue(await gang.publicSaleIsActive, 'Expected to be true');

        await truffleAssert.reverts(
            gang.publicMint(3, {from: user}),
            "You cannot mint Tier3 in public sale"
        );
    });
})