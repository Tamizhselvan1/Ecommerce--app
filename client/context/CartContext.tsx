import { CartItem, Product } from '@/constants/types';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/constants/api';
import { useAuth } from '@clerk/clerk-expo';
import Toast from 'react-native-toast-message';

type CartContextType = {
    cartItems: CartItem[];
    addToCart: (product: Product, size: string) => Promise<void>;
    removeFromCart: (productId: string, size: string) => Promise<void>;
    updateQuantity: (productId: string, quantity: number, size: string) => Promise<void>;
    clearCart: () => Promise<void>;
    cartTotal: number;
    itemCount: number;
    isLoading: boolean;
};

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [cartItems, setCartItems] = useState<CartItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [cartTotal, setCartTotal] = useState(0);
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const getHeaders = async () => {
        const token = await getToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    const fetchCart = async () => {
        if (!isLoaded || !isSignedIn) return;
        setIsLoading(true);
        try {
            const config = await getHeaders();
            const response = await api.get('/cart', config);
            if (response.data.success) {
                const serverCart = response.data.data;
                const mappedItems: CartItem[] = serverCart.items.map((item: any) => ({
                    id: `${item.product._id}-${item.size}`,
                    productId: item.product._id,
                    product: item.product,
                    quantity: item.quantity,
                    size: item.size ?? 'M',
                    price: item.price,
                }));
                setCartItems(mappedItems);
                setCartTotal(serverCart.totalAmount);
            }
        } catch (error) {
            console.error("Failed to fetch cart:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const addToCart = async (product: Product, size: string) => {
        try {
            const config = await getHeaders();
            await api.post('/cart/add', { productId: product._id, quantity: 1, size }, config);
            await fetchCart(); // Refresh cart from server
            Toast.show({
                type: 'success',
                text1: 'Added to Cart',
                text2: `${product.name} was added to your cart.`
            });
        } catch (error: any) {
            console.error("Failed to add to cart:", error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Failed to Add',
                text2: error.response?.data?.message || 'Something went wrong.'
            });
        }
    };

    const removeFromCart = async (productId: string, size: string) => {
        try {
            const config = await getHeaders();
            await api.delete(`/cart/item/${productId}?size=${size}`, config);
            await fetchCart();
        } catch (error) {
            console.error("Failed to remove from cart:", error);
        }
    };

    const updateQuantity = async (productId: string, quantity: number, size: string) => {
        if (quantity <= 0) {
            await removeFromCart(productId, size);
            return;
        }
        try {
            const config = await getHeaders();
            await api.put(`/cart/item/${productId}`, { quantity, size }, config);
            await fetchCart();
        } catch (error) {
            console.error("Failed to update cart quantity:", error);
        }
    };

    const clearCart = async () => {
        try {
            const config = await getHeaders();
            await api.delete('/cart', config);
            await fetchCart();
        } catch (error) {
            console.error("Failed to clear cart:", error);
        }
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchCart();
        } else if (isLoaded && !isSignedIn) {
            setCartItems([]);
            setCartTotal(0);
        }
    }, [isLoaded, isSignedIn]);

    const itemCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                itemCount,
                isLoading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}