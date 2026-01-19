
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

            const updatedCart = await userModel.findByIdAndUpdate(
                userID, 
                { shoppingCart: newItems },
                { returnOriginal: false, returnDocument: "after" }
            )

            return res.status(200).json({ message: 'cart updated', updatedCart: updatedCart.shoppingCart })

        } else {

            let itemExistIndex = -1

            for (let i = 0; i < newItems.length; i++) {
                const existingItemIndex = userCart.shoppingCart.findIndex((item) => {
                    return newItems[i].productId === String(item.productId) && newItems[i].size === item.size
                })

                if (existingItemIndex !== -1) {
                    itemExistIndex = existingItemIndex
                    const user = await userModel.findById(userID)
                    user.shoppingCart[existingItemIndex].quantity += newItems[i].quantity
                    await user.save()
                    
                    return res.status(200).json({ 
                        message: 'quantity updated', 
                        updatedCart: user.shoppingCart 
                    })
                }
            }

            const updatedCart = await userModel.findByIdAndUpdate(
                userID, 
                { $push: { shoppingCart: newItems } }, 
                { returnOriginal: false, returnDocument: "after" }
            )

            res.status(200).json({ message: 'cart updated', updatedCart: updatedCart.shoppingCart })
        }

    } catch (error) {
        res.json({ message: error.message })
    }

}


const removeCartItems = async (req, res) => {

    try {
        const userID = req.params.userID
        const { productId, size } = req.body

        if (!productId) {
            return res.status(400).json({ message: 'productId is required' })
        }

        const user = await userModel.findById(userID)

        if (!user) {
            return res.status(404).json({ message: 'user not found' })
        }

        const updatedCart = user.shoppingCart.filter(item => {
            if (size) {
                return !(String(item.productId) === productId && item.size === size)
            }
            return String(item.productId) !== productId
        })

        await userModel.findByIdAndUpdate(userID, { shoppingCart: updatedCart })

        res.status(200).json({ 
            message: 'Item removed from cart', 
            cart: updatedCart 
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

const updateCartItemQuantity = async (req, res) => {

    try {
        const userID = req.params.userID
        const { productId, size, quantity } = req.body

        if (!productId || !size || !quantity) {
            return res.status(400).json({ message: 'productId, size, and quantity are required' })
        }

        if (quantity < 1) {
            return res.status(400).json({ message: 'quantity must be at least 1' })
        }

        const user = await userModel.findById(userID)

        if (!user) {
            return res.status(404).json({ message: 'user not found' })
        }

        const itemIndex = user.shoppingCart.findIndex(item => 
            String(item.productId) === productId && item.size === size
        )

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' })
        }

        user.shoppingCart[itemIndex].quantity = quantity

        await user.save()

        res.status(200).json({ 
            message: 'Quantity updated', 
            cart: user.shoppingCart 
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

const updateCartItemSize = async (req, res) => {

    try {
        const userID = req.params.userID
        const { productId, oldSize, newSize } = req.body

        if (!productId || !oldSize || !newSize) {
            return res.status(400).json({ message: 'productId, oldSize, and newSize are required' })
        }

        const user = await userModel.findById(userID)

        if (!user) {
            return res.status(404).json({ message: 'user not found' })
        }

        const existingItem = user.shoppingCart.find(item => 
            String(item.productId) === productId && item.size === newSize
        )

        if (existingItem) {
            return res.status(400).json({ message: 'An item with this size already exists in cart' })
        }

        const itemIndex = user.shoppingCart.findIndex(item => 
            String(item.productId) === productId && item.size === oldSize
        )

        if (itemIndex === -1) {
            return res.status(404).json({ message: 'Item not found in cart' })
        }

        user.shoppingCart[itemIndex].size = newSize

        await user.save()

        res.status(200).json({ 
            message: 'Size updated', 
            cart: user.shoppingCart 
        })

    } catch (error) {
        res.status(500).json({ message: error.message })
    }

}

module.exports = { getUserCartItems, addNewCartItems, removeCartItems, updateCartItemQuantity, updateCartItemSize }