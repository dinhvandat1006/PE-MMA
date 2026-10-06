import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList } from 'react-native';
import { Feather } from '@expo/vector-icons';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  quantity: number;
  selected: boolean;
}

const initialProducts: Product[] = [
  {
    id: '1',
    name: 'Ultraboost 1.0 Shoes',
    description: 'Promo codes will not apply to this product',
    price: 118,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&q=80', // Placeholder shoe
    quantity: 1,
    selected: false,
  },
  {
    id: '2',
    name: 'ADIDAS Runesy',
    description: 'Buy ADIDAS Runesy M Running Shoes For Men Online',
    price: 200,
    image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=500&q=80', // Placeholder shoe
    quantity: 1,
    selected: true,
  },
  {
    id: '3',
    name: 'Adidas | Ultraboost Light',
    description: 'Buy Ultraboost Light M Running Shoes For Men Online',
    price: 250,
    image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=500&q=80', // Placeholder shoe
    quantity: 1,
    selected: false,
  },
];

const ShoppingCart = () => {
  const [products, setProducts] = useState<Product[]>(initialProducts);

  const toggleSelect = (id: string) => {
    setProducts((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, selected: !item.selected } : item
      )
    );
  };

  const updateQuantity = (id: string, delta: number) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const newQuantity = Math.max(1, item.quantity + delta);
          return { ...item, quantity: newQuantity };
        }
        return item;
      })
    );
  };

  const handleDelete = () => {
    setProducts((prev) => prev.filter((item) => !item.selected));
  };

  const total = products
    .filter((item) => item.selected)
    .reduce((sum, item) => sum + item.price * item.quantity, 0);

  const renderItem = ({ item }: { item: Product }) => (
    <View style={styles.productCard}>
      <View style={styles.imageContainer}>
        <Image source={{ uri: item.image }} style={styles.productImage} />
      </View>
      
      <View style={styles.productDetails}>
        <View style={styles.productHeader}>
          <Text style={styles.productName} numberOfLines={1}>{item.name}</Text>
          <TouchableOpacity 
            style={[styles.checkbox, item.selected && styles.checkboxSelected]} 
            onPress={() => toggleSelect(item.id)}
          >
            {item.selected && <Feather name="check" size={14} color="#fff" />}
          </TouchableOpacity>
        </View>
        
        <Text style={styles.productDescription} numberOfLines={2}>
          {item.description}
        </Text>
        
        <View style={styles.productFooter}>
          <Text style={styles.productPrice}>{item.price} $</Text>
          <View style={styles.quantityContainer}>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => updateQuantity(item.id, -1)}
            >
              <Feather name="minus" size={16} color="#888" />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity 
              style={styles.quantityButton} 
              onPress={() => updateQuantity(item.id, 1)}
            >
              <Feather name="plus" size={16} color="#007BFF" />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Shopping Cart</Text>
        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
      />

      <View style={styles.bottomSection}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>Total</Text>
          <Text style={styles.totalValue}>{total} $</Text>
        </View>
        <TouchableOpacity style={styles.checkoutButton}>
          <Text style={styles.checkoutButtonText}>Checkout</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  deleteButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 6,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  deleteButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContent: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
  },
  productCard: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F5F5F5',
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#F9F9F9',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    marginRight: 12,
  },
  productImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  productDetails: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  productName: {
    fontSize: 15,
    fontWeight: '600',
    color: '#333',
    flex: 1,
    marginRight: 10,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderWidth: 1.5,
    borderColor: '#007BFF',
    borderRadius: 4,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxSelected: {
    backgroundColor: '#007BFF',
  },
  productDescription: {
    fontSize: 12,
    color: '#777',
    marginTop: 4,
  },
  productFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  productPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FF4D4D',
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantityButton: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  quantityText: {
    marginHorizontal: 12,
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingTop: 15,
    paddingBottom: 25,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    backgroundColor: '#fff',
  },
  totalContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FF4D4D',
  },
  checkoutButton: {
    backgroundColor: '#007BFF',
    paddingVertical: 15,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default ShoppingCart;
