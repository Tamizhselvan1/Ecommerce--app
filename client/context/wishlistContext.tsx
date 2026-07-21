import { Product, WishlistContextType } from '@/constants/types';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import api from '@/constants/api';
import { useAuth } from '@clerk/clerk-expo';

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
    const [wishlist, setWishlist] = useState<Product[]>([]);
    const [loading, setLoading] = useState(false);
    const { getToken, isLoaded, isSignedIn } = useAuth();

    const getHeaders = async () => {
        const token = await getToken();
        return {
            headers: {
                Authorization: `Bearer ${token}`
            }
        };
    };

    const fetchWishlist = async () => {
        if (!isLoaded || !isSignedIn) return;
        setLoading(true);
        try {
            const config = await getHeaders();
            const response = await api.get('/wishlist', config);
            if (response.data.success && response.data.data) {
                // response.data.data has a `products` array
                setWishlist(response.data.data.products);
            }
        } catch (error) {
            console.error("Failed to fetch wishlist:", error);
        } finally {
            setLoading(false);
        }
    };

    const toggleWishlist = async (product: Product) => {
        const exists = isInWishlist(product._id);
        
        // Optimistic update
        if (exists) {
            setWishlist(prev => prev.filter(p => p._id !== product._id));
        } else {
            setWishlist(prev => [...prev, product]);
        }

        try {
            const config = await getHeaders();
            await api.post('/wishlist/toggle', { productId: product._id }, config);
        } catch (error) {
            console.error("Failed to toggle wishlist:", error);
            // Revert on failure
            await fetchWishlist();
        }
    };

    const isInWishlist = (productId: string) => {
        return wishlist.some(p => p._id === productId);
    };

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            fetchWishlist();
        } else if (isLoaded && !isSignedIn) {
            setWishlist([]);
        }
    }, [isLoaded, isSignedIn]);

    return (
        <WishlistContext.Provider
            value={{
                wishlist,
                loading,
                toggleWishlist,
                isInWishlist,
            }}
        >
            {children}
        </WishlistContext.Provider>
    );
}

export function useWishlist() {
    const context = useContext(WishlistContext);
    if (context === undefined) {
        throw new Error('useWishlist must be used within a WishlistProvider');
    }
    return context;
}