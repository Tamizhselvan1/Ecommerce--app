import { View, Text, TouchableOpacity, Image } from 'react-native'
import React from 'react'
import { ProductCardProps } from '@/constants/types'
import { Link } from 'expo-router'
import { Ionicons } from '@expo/vector-icons'
import { COLORS } from '@/constants'
import { useWishlist } from '@/context/wishlistContext'
import { useColorScheme } from 'nativewind'

export default function ProductCard({product}:ProductCardProps) {
    const { colorScheme } = useColorScheme();
    const isDark = colorScheme === 'dark';
    const {toggleWishlist, isInWishlist} = useWishlist()
    const isLiked = isInWishlist(product._id);
  return (
    <Link href={`/product/${product._id}`} asChild>
        <TouchableOpacity className='w-[48%] mb-4 bg-white dark:bg-gray-900 rounded-lg overflow-hidden shadow-sm'>
            <View className='relative h-56 w-full bg-gray-100 dark:bg-gray-800'>
                <Image source={{uri: product.images[0]}} className='w-full h-full'
                 resizeMode='cover'/>

                 {/* faviourte icon */}
                 <TouchableOpacity className='absolute top-2 right-7 z-10 p-2 bg-white dark:bg-gray-800 rounded-full shadow-sm'
                 onPress={(e)=>{e.stopPropagation(); toggleWishlist(product)}}>
                    <Ionicons name={isLiked ? 'heart' : 'heart-outline'} 
                 size={20} color={isLiked? COLORS.accent : (isDark ? '#e5e7eb' : COLORS.primary)} />
                 </TouchableOpacity>

                 {/* is Featured */}
                    {product.isFeatured && (
                        <View className='absolute top-2 left-2 bg-black dark:bg-gray-950 px-2 py-1 rounded'>
                            <Text className='text-white text-xs font-bold uppercase'>Featured</Text>
                        </View>
                    )}
                 
            </View>

            {/* product info */}
            <View className='p-3'>
                <View className='flex-row items-center mb-1'>
                    <Ionicons name='star' size={14}
                    color='#FFD700' />
                    <Text className='text-secondary dark:text-gray-400 text-xs ml-1'>4.6</Text>
                </View>
                <Text className='text-primary dark:text-gray-100 font-medium text-sm mb-1' numberOfLines={1}>{product.name}</Text>
                <View className='flex-row items-center'>
                    <Text className='text-primary dark:text-gray-100 font-bold text-base'>${product.price.toFixed(2)}</Text>
                </View>
            </View>
        </TouchableOpacity>

        
    </Link>
  )
}