const clearStreage = async () => {
    try {
      await AsyncStorage.clear();
    } catch (error) {
      console.log(eror);
    }
  }
