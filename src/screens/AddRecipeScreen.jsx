import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {launchImageLibrary} from 'react-native-image-picker';

const AddRecipeScreen = ({navigation}) => {
  const [recipe, setRecipe] = useState({
    id: Date.now().toString(),
    name: '',
    category: 'Seafood',
    area: '',
    instructions: '',
    imageUri: '',
    ingredients: [{name: '', measure: ''}],
    isCustom: true,
  });

  // pour les changement des inputs
  const handleChange = (key, value) => {
    setRecipe({
      ...recipe,
      [key]: value,
    });
  };

  // pour les changement pour le nombre et les donnés des ingrediants
  const handleIngredientChange = (index, key, value) => {
    const updatedIngredients = [...recipe.ingredients];
    updatedIngredients[index] = {
      ...updatedIngredients[index],
      [key]: value,
    };
    setRecipe({
      ...recipe,
      ingredients: updatedIngredients,
    });
  };

  // pour ajouter des ingrediants
  const addIngredient = () => {
    setRecipe({
      ...recipe,
      ingredients: [...recipe.ingredients, {name: '', measure: ''}],
    });
  };

  // annulé un ingrédiant
  const removeIngredient = index => {
    if (recipe.ingredients.length > 1) {
      const updatedIngredients = recipe.ingredients.filter(
        (_, i) => i !== index,
      );
      setRecipe({
        ...recipe,
        ingredients: updatedIngredients,
      });
    }
  };

  // Sélection d'une image depuis la galerie
  const selectImage = () => {
    const options = {
      mediaType: 'photo',
      includeBase64: false,
      maxHeight: 800,
      maxWidth: 800,
    };

    launchImageLibrary(options, response => {
      if (response.didCancel) {
        console.log("L'utilisateur a annulé la sélection d'image");
      } else if (response.errorCode) {
        console.log('Erreur ImagePicker: ', response.errorMessage);
      } else {
        const imageUri = response.assets[0].uri;
        setRecipe({
          ...recipe,
          imageUri,
        });
      }
    });
  };

  // validation de les inputs
  const validateForm = () => {
    if (!recipe.name.trim()) {
      Alert.alert('Erreur', 'Veuillez entrer un nom pour la recette');
      return false;
    }

    if (!recipe.instructions.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter des instructions');
      return false;
    }

    if (!recipe.ingredients[0].name.trim()) {
      Alert.alert('Erreur', 'Veuillez ajouter au moins un ingrédient');
      return false;
    }

    return true;
  };

  // enregistré la recette
  const saveRecipe = async () => {
    if (!validateForm()) return;

    try {
      // Récupération des recettes existantes
      const existingRecipesJSON = await AsyncStorage.getItem('customRecipes');
      let existingRecipes = existingRecipesJSON
        ? JSON.parse(existingRecipesJSON)
        : [];

      // Ajout de la nouvelle recette
      existingRecipes.push(recipe);

      // Sauvegarde dans AsyncStorage
      await AsyncStorage.setItem(
        'customRecipes',
        JSON.stringify(existingRecipes),
      );

      Alert.alert('Succès', 'Votre recette a été ajoutée avec succès!', [
        {
          text: 'OK',
          onPress: () => navigation.navigate('Home'),
        },
      ]);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      Alert.alert('Erreur', 'Impossible de sauvegarder la recette');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidView}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}>
              <Text style={styles.backButtonText}>← Retour</Text>
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Ajouter une recette</Text>
          </View>

          <View style={styles.formContainer}>
            {/* Image de la recette */}
            <TouchableOpacity
              style={styles.imageSelector}
              onPress={selectImage}>
              {recipe.imageUri ? (
                <Image
                  source={{uri: recipe.imageUri}}
                  style={styles.previewImage}
                />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Text style={styles.imagePlaceholderText}>
                    Appuyez pour ajouter une image
                  </Text>
                </View>
              )}
            </TouchableOpacity>

            {/* Nom de la recette */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom de la recette *</Text>
              <TextInput
                style={styles.input}
                value={recipe.name}
                onChangeText={text => handleChange('name', text)}
                placeholder="Ex: Crevettes à l'ail"
              />
            </View>

            {/* Origine */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Origine</Text>
              <TextInput
                style={styles.input}
                value={recipe.area}
                onChangeText={text => handleChange('area', text)}
                placeholder="Ex: Française, Italienne, etc."
              />
            </View>

            {/* Ingrédients */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Ingrédients *</Text>
              {recipe.ingredients.map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <TextInput
                    style={[styles.input, styles.ingredientInput]}
                    value={ingredient.name}
                    onChangeText={text =>
                      handleIngredientChange(index, 'name', text)
                    }
                    placeholder="Ingrédient"
                  />
                  <TextInput
                    style={[styles.input, styles.measureInput]}
                    value={ingredient.measure}
                    onChangeText={text =>
                      handleIngredientChange(index, 'measure', text)
                    }
                    placeholder="Quantité"
                  />
                  <TouchableOpacity
                    style={styles.removeButton}
                    onPress={() => removeIngredient(index)}>
                    <Text style={styles.removeButtonText}>-</Text>
                  </TouchableOpacity>
                </View>
              ))}
              <TouchableOpacity
                style={styles.addButton}
                onPress={addIngredient}>
                <Text style={styles.addButtonText}>
                  + Ajouter un ingrédient
                </Text>
              </TouchableOpacity>
            </View>

            {/* Instructions */}
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Instructions *</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={recipe.instructions}
                onChangeText={text => handleChange('instructions', text)}
                placeholder="Étapes de préparation..."
                multiline
                textAlignVertical="top"
                numberOfLines={6}
              />
            </View>

            {/* Bouton de sauvegarde */}
            <TouchableOpacity style={styles.saveButton} onPress={saveRecipe}>
              <Text style={styles.saveButtonText}>Enregistrer la recette</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    marginTop: 50,
  },
  keyboardAvoidView: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButton: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0D6EFD',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#20232A',
    marginLeft: 15,
  },
  formContainer: {
    padding: 20,
  },
  imageSelector: {
    width: '100%',
    height: 200,
    backgroundColor: '#E9ECEF',
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
  },
  previewImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    color: '#6C757D',
    fontSize: 16,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#343A40',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CED4DA',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    color: '#212529',
  },
  textArea: {
    minHeight: 120,
  },
  ingredientRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  ingredientInput: {
    flex: 3,
    marginRight: 10,
  },
  measureInput: {
    flex: 2,
    marginRight: 10,
  },
  removeButton: {
    backgroundColor: '#F8D7DA',
    width: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  removeButtonText: {
    fontSize: 18,
    color: '#DC3545',
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#E2F3FC',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 5,
  },
  addButtonText: {
    color: '#0D6EFD',
    fontSize: 16,
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: '#0D6EFD',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default AddRecipeScreen;
