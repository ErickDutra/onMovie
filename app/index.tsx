import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Button,
  TextInput,
  Image,
  ListRenderItemInfo,
} from "react-native";
import { Link, router } from "expo-router";
import Octicons from '@expo/vector-icons/Octicons';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  vote_average: number;
}

export default function HomeScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [model, setModel] = useState<string>('discover');

  const goToMovie = useCallback((item: Movie) => {
    router.push(`/movie/${item.id}`);
  }, []);

  const procurarMovie = useCallback((nome: string) => {
    if (nome.trim() === '') {
      setModel('discover');
    } else {
      setModel('search');
    }
    setSearchTerm(nome);
  }, []);

  useEffect(() => {
    fetch(
      `https://api.themoviedb.org/3/${model}/movie?api_key=a6e48a30c8ea452c82b3aedd9cf82643&query=${searchTerm}&language=pt-Br`
    )
      .then((response) => response.json())
      .then((data) => setMovies(data.results))
      .catch((error) => console.error(error));
  }, [model, searchTerm]);

  const handlePress = useCallback((item: Movie) => {
    setSelectedMovieId((prevSelectedMovieId) =>
      prevSelectedMovieId === item.id ? null : item.id
    );
  }, []);

  const renderItem = useCallback(({ item }: ListRenderItemInfo<Movie>) => (
    <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
      <ImageBackground
        source={{ uri: `https://image.tmdb.org/t/p/w500${item.poster_path}` }}
        style={styles.cardImage}
        imageStyle={{ borderRadius: 10, width: '100%', height: '102%', padding: 0, margin: 0 }}
      >
        <View style={styles.cardContentContainer}>
          <Text style={styles.cardTitle}>{item.title} - {item.vote_average.toPrecision(2)}/10</Text>
          <Button
            title="Ver Detalhes"
            onPress={() => goToMovie(item)}
            color = "#8c2b2b"
          />
          {selectedMovieId === item.id && (
            <Text style={styles.cardContent}>{item.overview}</Text>
          )}
        </View>
      </ImageBackground>
    </TouchableOpacity>
  ), [selectedMovieId, goToMovie, handlePress]);

  const keyExtractor = useCallback((item: Movie) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      <View style={styles.containerFilter}> 
      <TextInput
        placeholder="Procurar filme.."
        value={searchTerm}
        onChangeText={procurarMovie}
        style={styles.textInput }
      />
      <TouchableOpacity style={styles.button} onPress={()=>{}}>
      <Octicons name="filter" size={32} color="bleck" />
      </TouchableOpacity>

      </View>

      <FlatList
        data={movies}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={(data, index) => (
          { length: 500, offset: 500 * index, index }
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textInput:{
    backgroundColor:'white',
    width:'88%'
  },
  button: {
    width: 50,
    height: 50,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },
  buttonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },

  containerFilter:{
  width:'100%',
  display:'flex',
  flexDirection:'row', 
  backgroundColor:'white',
  },
  cardImage: {
    width: "100%",
    height: 550,
    borderRadius: 10,
    marginBottom: 10,
  },
  cardContentContainer: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    width: "100%",
    position: "absolute",
    bottom: -10,
    padding: 10,
    borderRadius: 10,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "grey",
  },
  card: {
    width: 400,
    borderRadius: 10,
    backgroundColor: "green",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    marginBottom: 20,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 10,
    alignSelf: "center",
  },
  cardContent: {
    fontSize: 14,
    color: "white",
  },
});