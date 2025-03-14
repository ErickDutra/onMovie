import React, { Children, useEffect, useState } from "react";
import { View, Text, StyleSheet, Image,ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  release_date: string;
}

interface Credit {
  id: number;
  name: string;
  character: string;
  profile_path: string;
}


export default function MovieDetailsScreen() {
  const {movieId} = useLocalSearchParams();
  const [movie, setMovie] = useState<Movie>();
  const [credits, setCredits] = useState<Credit[]>([])

  useEffect(() => {
    fetch(`https://api.themoviedb.org/3/movie/${movieId}?api_key=a6e48a30c8ea452c82b3aedd9cf82643&language=pt-Br`)
      .then((response) => response.json())
      .then((data) => setMovie(data))
      .catch((error) => console.error(error));


      fetch(`https://api.themoviedb.org/3/movie/${movieId}/credits?api_key=a6e48a30c8ea452c82b3aedd9cf82643&language=pt-Br`)
      .then((response) => response.json())
      .then((data) => setCredits(data.cast.slice(0, 10)))
      .catch((error) => console.error(error));


  }, [movieId]);

  if (!movie) {
    return (
      <View style={styles.container}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} >
      <View>
        <Image
          source={{ uri: `https://image.tmdb.org/t/p/w500${movie.poster_path}` }}
          style={styles.image}
        />
      </View>
      <Text style={styles.title}>{movie.title}</Text>
      <Text style={styles.date}>{movie.release_date 
      }</Text>
      <Text style={styles.description}>{movie.overview}</Text>
      <Text style={styles.subtitle}>Elenco:</Text>
      {credits.map((member) => (
        <View key={member.id} style={styles.castMember}>
          <Image
            source={{ uri: `https://image.tmdb.org/t/p/w200${member.profile_path}` }}
            style={styles.castImage}
          />
          <View style={styles.castInfo}>
            <Text style={styles.castName}>{member.name}</Text>
            <Text style={styles.castCharacter}>{member.character}</Text>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "grey",
    padding: 20,
  },
  date:{
    color: "black",
    fontSize: 13,
    textShadowColor: "black",
    fontWeight: "bold",

  }
  ,
  image: {
    alignSelf: "center",
    marginTop:40,
    width: 300,
    height: 450,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "white",
    textShadowColor: "black",

  },
  description: {
    fontSize: 16,
    color: "white",
    marginBottom:50,
    textShadowColor: "black",
    shadowOffset: { width: 2, height: 2 },
  },
  castMember: {
    flexDirection: "row",
    marginBottom: 10,
  },
  castImage: {
    width: 50,
    height: 75,
    borderRadius: 5,
  },
  castInfo: {
    marginLeft: 10,
  },
  castName: {
    fontSize: 16,
    fontWeight: "bold",
    color: "white",
  },
  castCharacter: {
    fontSize: 14,
    color: "white",
  },
  subtitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
  },
});