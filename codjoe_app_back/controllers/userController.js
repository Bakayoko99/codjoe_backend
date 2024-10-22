
const userModel = require('../models/userModel');

const getUserCartItems = async (req, res) => {

    try {
        const userID = req.params.userID
        const user = await userModel.findById(userID)


        const userItems = []

        if (!user) {
            return res.status(400).send('user not found')
        }
        if (user.shoppingCart.length > 0) {
            user.shoppingCart.forEach(item => {
                userItems.push(item)
            });

            res.status(200).json({
                data: userItems
            })

        } else {

            res.send('shopping cart empty')
        }

    } catch (error) {
        res.json({ message: error.message })
    }

}

const addNewCartItems = async (req, res) => {

    try {

        const userID = req.params.userID
        const userCart = await userModel.findById(userID).select({ shoppingCart: 1 }).lean()
        const items = req.body?.newItems

        const newItems = []

        items.forEach(item => {
            newItems.push({
                productId: item.id,
                size: item.size,
                quantity: item.quantity
            })
        });

        if (!userCart) {
            return res.status(400).send('user not found')
        }

        if (newItems.length < 1) {
            return res.status(400).send('new items not found')
        }

        if (userCart.shoppingCart.length < 1) {

            await userModel.findByIdAndUpdate(userID, { shoppingCart: newItems })

        } else {

            let itemExist = false

            for (i = 0; i < newItems.length; i++) {

                userCart.shoppingCart.map((item) => {
                    if (newItems[i].productId === String(item.productId) && newItems[i].size === item.size) {

                        itemExist = true
                    }
                })

            }

            if (itemExist) {

                return res.status(400).json('some product already exist')
            }

            const updatedCart = await userModel.findByIdAndUpdate(userID, { $push: { shoppingCart: newItems } }, { returnOriginal: false, returnDocument: "after" })

            res.status(200).json({ message: 'cart updated: ', updatedCart: updatedCart.shoppingCart })
        }

    } catch (error) {
        res.json({ message: error.message })
    }

}


const removeCartItems = async (req, res) => {

    try {
        const userID = req.params.userID

        

    } catch (error) {
        res.json({ message: error.message })
    }

}

module.exports = { getUserCartItems, addNewCartItems, removeCartItems }