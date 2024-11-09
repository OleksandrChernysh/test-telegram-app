import React, { useState, useEffect } from 'react'
import { LineChart, CartesianGrid, XAxis, YAxis, Tooltip, Line } from 'recharts'

const serverUrl = 'https://251c-92-118-77-161.ngrok-free.app';

// Sample data structure for products
const initialProducts = [
    {
        id: 1,
        name: 'item01',
        price: 100,
        quantity: 0,
        category: 'category_name01',
        description: 'Description 1',
        imageUrl: 'www.url.com/photo01.jpg',
    },
    {
        id: 2,
        name: 'item02',
        price: 200,
        quantity: 0,
        category: 'category_name01',
        description: 'Description 2',
        imageUrl: 'www.url.com/photo02.jpg',
    },
    // Add more products...
]

const App = () => {
    const [currentPage, setCurrentPage] = useState('main')
    const [products, setProducts] = useState(initialProducts)
    const [selectedDelivery, setSelectedDelivery] = useState(null)
    const [orderData, setOrderData] = useState({})
    const [showModal, setShowModal] = useState(false)
    const [selectedProduct, setSelectedProduct] = useState(null)

    // Initialize Telegram WebApp
    useEffect(() => {
        const tg = window.Telegram?.WebApp
        if (tg) {
            tg.ready()
            // Enable closing confirmation
            tg.enableClosingConfirmation()
            // Expand the WebApp to full height
            tg.expand()
        }
    }, [])

    const calculateTotal = () => {
        const subtotal = products.reduce(
            (sum, product) => sum + product.price * product.quantity,
            0,
        )
        let discountRate = 0.05 // Default 5%

        if (subtotal > 4000) discountRate = 0.09
        else if (subtotal > 2000) discountRate = 0.07

        const finalTotal = subtotal * (1 - discountRate)
        return { subtotal, finalTotal, discountRate }
    }

    const ProductTable = () => (
        <div className="w-full max-w-4xl mx-auto p-4">
            <table className="w-full border-collapse">
                <thead>
                    <tr>
                        <th className="border p-2">Товар</th>
                        <th className="border p-2">Ціна (грн)</th>
                        <th className="border p-2">Кількість</th>
                    </tr>
                </thead>
                <tbody>
                    {products.map((product) => (
                        <tr key={product.id}>
                            <td className="border p-2">{product.name}</td>
                            <td className="border p-2">{product.price}</td>
                            <td className="border p-2">
                                <div className="flex items-center justify-center gap-2">
                                    <button
                                        className="px-2 py-1 bg-blue-500 text-white rounded"
                                        onClick={() =>
                                            updateQuantity(product.id, -1)
                                        }
                                    >
                                        -
                                    </button>
                                    <span>{product.quantity}</span>
                                    <button
                                        className="px-2 py-1 bg-blue-500 text-white rounded"
                                        onClick={() =>
                                            updateQuantity(product.id, 1)
                                        }
                                    >
                                        +
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <button
                className="mt-4 px-4 py-2 bg-blue-500 text-white rounded"
                onClick={() => setCurrentPage('categories')}
            >
                Допоможу обрати
            </button>
        </div>
    )

    const CategoryCloud = () => {
        const categories = [...new Set(products.map((p) => p.category))]

        return (
            <div className="p-4">
                <div className="flex flex-wrap gap-4 justify-center">
                    {categories.map((category) => {
                        const count = products.filter(
                            (p) => p.category === category,
                        ).length
                        const fontSize = Math.max(14, Math.min(24, count * 2))

                        return (
                            <button
                                key={category}
                                style={{ fontSize: `${fontSize}px` }}
                                className="px-4 py-2 bg-blue-100 rounded hover:bg-blue-200"
                                onClick={() => showCategoryProducts(category)}
                            >
                                {category}
                            </button>
                        )
                    })}
                </div>
                <button
                    className="mt-4 px-4 py-2 bg-gray-500 text-white rounded"
                    onClick={() => setCurrentPage('main')}
                >
                    ← Назад
                </button>
            </div>
        )
    }

    const showCategoryProducts = (category) => {
        setProducts(initialProducts.filter((p) => p.category === category))
        setCurrentPage('main')
    }

    const DeliveryForm = () => (
        <div className="p-4 max-w-xl mx-auto">
            <h2 className="text-xl mb-4">Яка в вас адреса для Нової Пошти</h2>
            <div className="space-y-4">
                <button
                    className={`w-full p-2 rounded ${selectedDelivery === 'office' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setSelectedDelivery('office')}
                >
                    Доставка на відділення/поштомат
                </button>
                <button
                    className={`w-full p-2 rounded ${selectedDelivery === 'address' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
                    onClick={() => setSelectedDelivery('address')}
                >
                    Адресна доставка
                </button>

                {selectedDelivery && (
                    <form className="space-y-4" onSubmit={handleDeliverySubmit}>
                        <input
                            required
                            className="w-full p-2 border rounded"
                            placeholder="ОТРИМУВАЧ *"
                            name="receiver"
                        />
                        <input
                            required
                            className="w-full p-2 border rounded"
                            placeholder="ТЕЛЕФОН *"
                            name="phone"
                            type="tel"
                            pattern={
                                selectedDelivery === 'address'
                                    ? '\\+380\\d{9}'
                                    : '\\d{10}'
                            }
                        />
                        <input
                            required
                            className="w-full p-2 border rounded"
                            placeholder="МІСТО/СЕЛО *"
                            name="city"
                        />
                        <input
                            className="w-full p-2 border rounded"
                            placeholder="ОБЛАСТЬ, РАЙОН"
                            name="region"
                        />
                        {selectedDelivery === 'office' ? (
                            <input
                                required
                                className="w-full p-2 border rounded"
                                placeholder="ВІДДІЛЕННЯ АБО ПОШТОМАТ *"
                                name="np"
                            />
                        ) : (
                            <input
                                required
                                className="w-full p-2 border rounded"
                                placeholder="ВУЛИЦЯ, БУДИНОК *"
                                name="address"
                            />
                        )}
                        <button
                            type="submit"
                            className="w-full p-2 bg-blue-500 text-white rounded"
                        >
                            ДАЛІ
                        </button>
                    </form>
                )}
            </div>
        </div>
    )

    const PaymentSelection = () => (
        <div className="p-4 max-w-xl mx-auto">
            <div className="space-y-4">
                <button
                    className="w-full p-4 bg-blue-100 rounded hover:bg-blue-200"
                    onClick={() => handlePaymentSelection('nalozhka')}
                >
                    НАЛОЖКА
                </button>
                <button
                    className="w-full p-4 bg-blue-100 rounded hover:bg-blue-200"
                    onClick={() => handlePaymentSelection('peredplata')}
                >
                    ПЕРЕДПЛАТА НА РАХУНОК
                </button>
            </div>
        </div>
    )

    const OrderConfirmation = () => {
        const { subtotal, finalTotal, discountRate } = calculateTotal()
        const accountNumber = '1112223333444545'

        return (
            <div className="p-4 max-w-xl mx-auto">
                <h2 className="text-xl mb-4">Підтвердження замовлення</h2>
                <div className="space-y-4">
                    <div className="border p-4 rounded">
                        {products
                            .filter((p) => p.quantity > 0)
                            .map((product) => (
                                <div
                                    key={product.id}
                                    className="flex justify-between mb-2"
                                >
                                    <span>
                                        {product.name} x {product.quantity}
                                    </span>
                                    <span>
                                        {product.price * product.quantity} грн
                                    </span>
                                </div>
                            ))}
                        <div className="border-t pt-2 mt-2">
                            <div className="font-bold">
                                Сума зі знижкою: {finalTotal.toFixed(2)} грн
                                (знижка {(discountRate * 100).toFixed()}%)
                            </div>
                        </div>
                    </div>

                    {orderData.paymentMethod === 'peredplata' && (
                        <div className="border p-4 rounded">
                            <div className="font-bold">НОМЕР РАХУНКА:</div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono">
                                    {accountNumber}
                                </span>
                                <button
                                    className="px-2 py-1 bg-blue-500 text-white rounded text-sm"
                                    onClick={() =>
                                        navigator.clipboard.writeText(
                                            accountNumber,
                                        )
                                    }
                                >
                                    Скопіювати
                                </button>
                            </div>
                        </div>
                    )}

                    <button
                        className="w-full p-4 bg-green-500 text-white rounded"
                        onClick={handleOrderConfirmation}
                    >
                        {orderData.paymentMethod === 'peredplata'
                            ? 'ПІДТВЕРДЖУЮ, ОПЛАЧУЮ'
                            : 'ПІДТВЕРДЖУЮ'}
                    </button>
                </div>
            </div>
        )
    }

    const ProductModal = () =>
        selectedProduct && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg p-4 max-w-md w-full relative">
                    <button
                        className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowModal(false)}
                    >
                        ✕
                    </button>
                    <img
                        src={selectedProduct.imageUrl}
                        alt={selectedProduct.name}
                        className="w-full h-48 object-cover rounded mb-4"
                    />
                    <h3 className="text-xl font-bold mb-2">
                        {selectedProduct.name}
                    </h3>
                    <p className="text-gray-600 mb-2">
                        {selectedProduct.description}
                    </p>
                    <p className="text-lg font-bold mb-4">
                        {selectedProduct.price} грн
                    </p>
                    <button
                        className="w-full p-2 bg-blue-500 text-white rounded"
                        onClick={() => {
                            updateQuantity(selectedProduct.id, 1)
                            setShowModal(false)
                        }}
                    >
                        +
                    </button>
                </div>
            </div>
        )

    const updateQuantity = (productId, change) => {
        setProducts(
            products.map((product) =>
                product.id === productId
                    ? {
                          ...product,
                          quantity: Math.max(0, product.quantity + change),
                      }
                    : product,
            ),
        )
    }

    const handleDeliverySubmit = (e) => {
        e.preventDefault()
        const formData = new FormData(e.target)
        const deliveryData = Object.fromEntries(formData.entries())
        setOrderData({ ...orderData, delivery: deliveryData })
        setCurrentPage('payment')
    }

    const handlePaymentSelection = (method) => {
        setOrderData({ ...orderData, paymentMethod: method })
        setCurrentPage('confirmation')
    }

    const handleOrderConfirmation = async () => {
        const { subtotal, finalTotal, discountRate } = calculateTotal();

        // Create a cleaned products array with only purchased items
        const purchasedProducts = products
            .filter((p) => p.quantity > 0)
            .map(({ id, name, price, quantity }) => ({
                id,
                name,
                price,
                quantity,
            }));

        // Prepare order details object
        const orderDetails = {
            delivery: orderData.delivery,
            paymentMethod: orderData.paymentMethod,
            products: purchasedProducts,
            subtotal,
            finalTotal,
            discountRate: discountRate * 100,
            orderDate: new Date().toISOString(),
        };

        try {
            // Send the order details to the backend for local saving
            const response = await fetch(`${serverUrl}/save-order`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(orderDetails),
            })
            .then(response => response.json())
            .then(data => {
                console.log('Order saved successfully:', data);
                // Optional: Show confirmation message to the user
                alert('Order saved successfully!');
            })
            .catch(error => {
                console.error('Error saving order:', error);
                // Handle any errors here, e.g., show an error message to the user
                alert('Error saving order. Please try again later.');
            });

            if (response.ok) {
                // If the order is saved successfully, send data to Telegram WebApp
                const orderData = await response.json(); // Assuming the server responds with order data
                console.log("Order saved successfully:", orderData);

                // Send order data to Telegram WebApp
                window.Telegram.WebApp.sendData(JSON.stringify({
                    message: "Order saved successfully",
                    orderDetails: orderData
                }));
            } else {
                console.error("Failed to save order:", await response.text());
            }
        } catch (error) {
            console.error("Error sending order to server:", error);
        }

        // Send data back to the bot and close WebApp if Telegram WebApp is available
        if (window.Telegram?.WebApp) {
            try {
                const orderString = JSON.stringify(orderDetails);
                console.log('Sending order details:', orderString);
                window.Telegram.WebApp.sendData(orderString);
                setTimeout(() => window.Telegram.WebApp.close(), 100);
            } catch (error) {
                console.error('Error sending order:', error);
                alert('Помилка при відправці замовлення. Будь ласка, спробуйте ще раз.');
            }
        } else {
            console.error('Telegram WebApp is not available');
            alert('Будь ласка, відкрийте додаток через Telegram.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-100">
            {currentPage === 'main' && <ProductTable />}
            {currentPage === 'categories' && <CategoryCloud />}
            {currentPage === 'delivery' && <DeliveryForm />}
            {currentPage === 'payment' && <PaymentSelection />}
            {currentPage === 'confirmation' && <OrderConfirmation />}
            {showModal && <ProductModal />}

            {['main', 'categories'].includes(currentPage) && (
                <div className="fixed bottom-0 left-0 right-0 bg-white p-4 shadow-lg">
                    <div className="max-w-4xl mx-auto">
                        {calculateTotal().subtotal > 0 && (
                            <>
                                <div className="flex justify-between mb-2">
                                    <span>Сума замовлення:</span>
                                    <span>{calculateTotal().subtotal} грн</span>
                                </div>
                                <div className="flex justify-between mb-2">
                                    <span>Сума зі знижкою:</span>
                                    <span>
                                        {calculateTotal().finalTotal.toFixed(2)}{' '}
                                        грн
                                    </span>
                                </div>
                                {calculateTotal().subtotal > 1000 && (
                                    <div className="text-green-500 text-center mb-2">
                                        Безкоштовна доставка НП!
                                    </div>
                                )}
                                <button
                                    className="w-full p-2 bg-green-500 text-white rounded"
                                    onClick={() => setCurrentPage('delivery')}
                                >
                                    БЕРУ!
                                </button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}

export default App
