import { dummyCart } from '@/assets/assets';
import { CartItem, Product } from '@/constants/types';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';



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

    const calculateTotals = (items: CartItem[]) => {
        const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
        setCartTotal(total);
    };

    const fetchCart = async () => {
        setIsLoading(true);

        const serverCart = dummyCart;

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
        setIsLoading(false);
    };

    const addToCart = async (product: Product, size: string) => {
        setCartItems(prev => {
            const existing = prev.find(
                item => item.productId === product._id && item.size === size
            );

            let updated;

            if (existing) {
                updated = prev.map(item =>
                    item.id === existing.id
                        ? { ...item, quantity: item.quantity + 1 }
                        : item
                );
            } else {
                const newItem: CartItem = {
                    id: `${product._id}-${size}`,
                    productId: product._id,
                    product,
                    quantity: 1,
                    size,
                    price: product.price,
                };
                updated = [...prev, newItem];
            }

            calculateTotals(updated);
            return updated;
        });
    };

    const removeFromCart = async (productId: string, size: string) => {
        setCartItems(prev => {
            const updated = prev.filter(
                item => !(item.productId === productId && item.size === size)
            );

            calculateTotals(updated);
            return updated;
        });
    };

    const updateQuantity = async (
        productId: string,
        quantity: number,
        size: string
    ) => {
        if (quantity <= 0) return;

        setCartItems(prev => {
            const updated = prev.map(item =>
                item.productId === productId && item.size === size
                    ? { ...item, quantity }
                    : item
            );

            calculateTotals(updated);
            return updated;
        });
    };

    const clearCart = async () => {
        setCartItems([]);
        setCartTotal(0);
    };

    useEffect(() => {
        fetchCart();
    }, []);

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