import React, { useEffect, useState, useCallback, memo } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
  Button,
  TextInput,
  Modal,
  ListRenderItemInfo,
  Alert,
} from "react-native";
import { Link, router } from "expo-router";
import { CheckBox } from "react-native-elements";
import Octicons from "@expo/vector-icons/Octicons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { CODIGO_API } from '@env';

interface Movie {
  id: number;
  title: string;
  overview: string;
  poster_path: string;
  popularity: number;
  genre_ids: number[];
}

type Genre = {
  id: number;
  name: string;
};

export default function HomeScreen() {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [selectedMovieId, setSelectedMovieId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [model, setModel] = useState<string>("discover");
  const [modalVisible, setModalVisible] = useState(false);

  const [isPopularity, setIsPopularity] = useState(false);
  const [isAvarage, setIsAvarage] = useState(false);
  const [arrow, setArrow] = useState<"arrowup" | "arrowdown">("arrowup");
  const [arrowAvarage, setArrowAvarage] = useState<"arrowup" | "arrowdown">(
    "arrowup"
  );
  const [applyAvarage, setApplyAvarage] = useState<string>("");
  const [applyPopularity, setApplyPopularity] = useState<string>("");
  const [descAvarage, setDescAvarage] = useState<string>("");
  const [descPopularity, setDescPopularity] = useState<string>("");

  const [dateTerm, setDateTerm] = useState<string>("");
  const [maxDate, setMaxDate] = useState<string>();
  const [minDate, setMinDate] = useState<string>();
  const [minDay, setMinDay] = useState<string>();
  const [minMonth, setMinMonth] = useState<string>();
  const [minYear, setMinYear] = useState<string>();
  const [maxDay, setMaxDay] = useState<string>();
  const [maxMonth, setMaxMonth] = useState<string>();
  const [maxYear, setMaxYear] = useState<string>();
  const [ratings, setRatings] = useState<{ [key: number]: string }>({});

  const goToMovie = useCallback((item: Movie) => {
    router.push(`/movie/${item.id}`);
  }, []);

  const procurarMovie = useCallback((nome: string) => {
    if (nome.trim() === "") {
      setModel("discover");
    } else {
      setModel("search");
    }
    setSearchTerm(nome);
  }, []);

  const isStringEmpty = (str: string) => {
    return str?.trim().length === 0;
  };

  function filterPopularity() {
    if (isPopularity) {
      setApplyPopularity("&sort_by=popularity.");
      setDescPopularity(arrow === "arrowup" ? "desc" : "asc");
    }
  }

  function filterAvarage() {
    if (isAvarage && !isPopularity) {
      setApplyAvarage("&sort_by=vote_average.");
      setDescAvarage(arrowAvarage === "arrowup" ? "desc" : "asc");
    } else if (isAvarage && isPopularity) {
      setApplyAvarage("&vote_average.");
      setDescAvarage(arrowAvarage === "arrowup" ? "desc" : "asc");
    }
  }

  function filterDate() {
    setMaxDate(`${maxYear}-${maxMonth}-${maxDay}`);
    setMinDate(`${minYear}-${minMonth}-${minDay}`);
    if (
      !isStringEmpty(minDay!) &&
      !isStringEmpty(minYear!) &&
      !isStringEmpty(minMonth!) &&
      !isStringEmpty(maxDay!) &&
      !isStringEmpty(maxMonth!) &&
      !isStringEmpty(maxYear!)
    ) {
      try {
        if (Number(maxDay) > 31 || Number(minDay) > 31) {
          Alert.alert("Erro", "Dia invalido.", [{ text: "OK" }]);
        }

        if (Number(maxMonth) > 12 || Number(minMonth) > 12) {
          Alert.alert("Erro", "Mes invalido.", [{ text: "OK" }]);
        }

        if (Number(maxYear) > 2025 || Number(maxYear) < 1900) {
          Alert.alert("Erro", "Ano maximo invalido.", [{ text: "OK" }]);
        }

        if (Number(minYear) > 2025 || Number(minYear) < 1900) {
          Alert.alert("Erro", "Ano minimo invalido.", [{ text: "OK" }]);
        }
      } catch (error) {
        return Alert.alert("Erro", "digite uma data valida.", [{ text: "OK" }]);
      }
      setDateTerm(`&release_date.gte=${minDate}&release_date.lte=${maxDate}`);
    } else if (
      !isStringEmpty(minDay!) ||
      !isStringEmpty(minYear!) ||
      !isStringEmpty(minMonth!) ||
      !isStringEmpty(maxDay!) ||
      !isStringEmpty(maxMonth!) ||
      !isStringEmpty(maxYear!)
    ) {
      Alert.alert("Erro", "Todos os campos de data devem ser preenchidos.", [
        { text: "OK" },
      ]);
    }
  }

  function enableFilter() {
    filterPopularity();
    filterDate();
    filterAvarage();
    setModalVisible(false);
  }

  function cleanFilter() {
    if (!isPopularity) {
      setApplyPopularity("");
      setDescPopularity("");
    }
    if (!isAvarage) {
      setApplyAvarage("");
      setDescAvarage("");
    }

    setDateTerm("");
    setMaxDay("");
    setMaxMonth("");
    setMaxYear("");
    setMinDay("");
    setMinMonth("");
    setMinYear("");
    setMaxDate("");
    setMinDate("");

    setModalVisible(false);
  }

  function setCheckPopularity() {
    if (!isPopularity) {
      setIsPopularity(true);
    } else setIsPopularity(false);
  }

  function setCheckAvarage() {
    if (!isAvarage) {
      setIsAvarage(true);
    } else setIsAvarage(false);
  }

  const toggleArrowAvarage = () => {
    setArrowAvarage((prevArrow) =>
      prevArrow === "arrowup" ? "arrowdown" : "arrowup"
    );
  };

  const toggleArrow = () => {
    setArrow((prevAr) => (prevAr === "arrowup" ? "arrowdown" : "arrowup"));
  };
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetch(
          `https://api.themoviedb.org/3/${model}/movie?api_key=${CODIGO_API}=${searchTerm}&language=pt-Br${applyPopularity}${descPopularity}${applyAvarage}${descAvarage}${dateTerm}`
        );
        const data = await response.json();
        setMovies(data.results);

        const ratingsPromises = data.results.map(async (movie: Movie) => {
          const rating = await fetchBrazilianRating(movie?.id);
          return { id: movie?.id, rating };
        });

        const ratingsArray = await Promise.all(ratingsPromises);
        const ratingsMap = ratingsArray.reduce((acc, { id, rating }) => {
          acc[id] = rating;
          return acc;
        }, {} as { [key: number]: string });

        setRatings(ratingsMap);
      } catch (error) {
        console.error(error);
      }
    };

    fetchMovies();
  }, [
    model,
    searchTerm,
    applyPopularity,
    descPopularity,
    dateTerm,
    applyAvarage,
    descAvarage,
    arrow,
    arrowAvarage,
  ]);
  const [genres, setGenres] = useState<{ [key: number]: string }>({});
  const GENRE_URL = `https://api.themoviedb.org/3/genre/movie/list?api_key=${CODIGO_API}&language=pt-BR`;

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await fetch(GENRE_URL);
        const data = await response.json();

        const genreMap = data.genres.reduce(
          (acc: { [key: number]: string }, genre: Genre) => {
            acc[genre.id] = genre?.name;
            return acc;
          },
          {}
        );

        setGenres(genreMap);
      } catch (error) {
        console.error("Erro ao buscar os gêneros:", error);
      }
    };
    fetchGenres();
  }, []);

  const fetchBrazilianRating = async (movieId: number) => {
    try {
      const response = await fetch(
        `https://api.themoviedb.org/3/movie/${movieId}/release_dates?api_key=${CODIGO_API}`
      );
      const data = await response.json();

      const brRelease = data.results.find((r: any) => r.iso_3166_1 === "BR");
      if (brRelease && brRelease.release_dates.length > 0) {
        return brRelease.release_dates[0].certification || "Não informado";
      }

      return "Não informado";
    } catch (error) {
      console.error("Erro ao buscar classificação indicativa:", error);
      return "Erro";
    }
  };

  const handlePress = useCallback((item: Movie) => {
    setSelectedMovieId((prevSelectedMovieId) =>
      prevSelectedMovieId === item.id ? null : item.id
    );
  }, []);
  const renderItem = useCallback(
    ({ item }: ListRenderItemInfo<Movie>) => {
      const genreNames = (item.genre_ids ?? [])
        .map((id: number) => genres[id] ?? 'Carregando...')
        .filter(Boolean)
        .join(", ");
      const classificacao = ratings[item.id] || "Carregando...";
      return (
        <TouchableOpacity style={styles.card} onPress={() => handlePress(item)}>
          <ImageBackground
            source={{
              uri: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
            }}
            style={styles.cardImage}
            imageStyle={{
              borderRadius: 10,
              width: "100%",
              height: "102%",
              padding: 0,
              margin: 0,
            }}
          >
            <View style={styles.cardContentContainer}>
              <Text style={styles.cardTitle}>
                {item.title} - {classificacao}
              </Text>
              <Text style={styles.genreText}>
                Gênero: {genreNames || "Desconhecido"}
              </Text>
              <Button
                title="Ver Detalhes"
                onPress={() => goToMovie(item)}
                color="#8c2b2b"
              />
              {selectedMovieId === item.id && (
                <Text style={styles.cardContent}>{item.overview}</Text>
              )}
            </View>
          </ImageBackground>
        </TouchableOpacity>
      );
    },
    [selectedMovieId, goToMovie, handlePress, genres, ratings]
  );

  const keyExtractor = useCallback((item: Movie) => item.id.toString(), []);

  return (
    <View style={styles.container}>
      <View style={styles.containerFilter}>
        <TextInput
          placeholder="Procurar filme.."
          value={searchTerm}
          onChangeText={procurarMovie}
          style={styles.textInput}
        />
        <TouchableOpacity
          style={styles.button}
          onPress={() => setModalVisible(true)}
        >
          <Octicons name="filter" size={32} color="black" />
        </TouchableOpacity>
      </View>

      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text>Filtros</Text>
            <View>
              <View style={styles.flexRow}>
                <Text>Data Max:</Text>
                <TextInput
                  placeholder="dd"
                  value={maxDay}
                  onChangeText={(text) => {
                    setMaxDay(text);
                  }}
                  style={styles.inputData}
                />
                <TextInput
                  placeholder="mm"
                  value={maxMonth}
                  onChangeText={(text) => {
                    setMaxMonth(text);
                  }}
                  style={styles.inputData}
                />
                <TextInput
                  placeholder="yyyy"
                  value={maxYear}
                  onChangeText={(text) => {
                    setMaxYear(text);
                  }}
                  style={styles.inputDataYear}
                />
              </View>
              <View style={styles.flexRow}>
                <Text>Data Min:</Text>
                <TextInput
                  placeholder="dd"
                  value={minDay}
                  onChangeText={(text) => setMinDay(text)}
                  style={styles.inputData}
                />
                <TextInput
                  placeholder="mm"
                  value={minMonth}
                  onChangeText={(text) => {
                    setMinMonth(text);
                  }}
                  style={styles.inputData}
                />
                <TextInput
                  placeholder="yyyy"
                  value={minYear}
                  onChangeText={(text) => {
                    setMinYear(text);
                  }}
                  style={styles.inputDataYear}
                />
              </View>
            </View>
            <View style={styles.flexRow}>
              <CheckBox
                title="Avaliação      "
                checked={isAvarage}
                onPress={setCheckAvarage}
              />
              <TouchableOpacity
                style={styles.button}
                onPress={toggleArrowAvarage}
              >
                <AntDesign name={arrowAvarage} size={24} color="black" />
              </TouchableOpacity>
            </View>

            <View style={styles.flexRow}>
              <CheckBox
                title="Popularidade"
                checked={isPopularity}
                onPress={setCheckPopularity}
              />
              <TouchableOpacity style={styles.button} onPress={toggleArrow}>
                <AntDesign name={arrow} size={24} color="black" />
              </TouchableOpacity>
            </View>
            <View style={styles.flexRow}>
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => enableFilter()}
              >
                <Text style={styles.customButtonText}>Aplicar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.customButtonText}>Fechar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.customButton}
                onPress={() => cleanFilter()}
              >
                <Text style={styles.customButtonText}>Limpar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <FlatList
        data={movies}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        getItemLayout={(data, index) => ({
          length: 500,
          offset: 500 * index,
          index,
        })}
        initialNumToRender={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  textInput: {
    backgroundColor: "white",
    width: "88%",
  },
  inputData: {
    width: 32,
  },
  genreText: {
    fontSize: 14,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 5,
  },

  inputDataYear: {
    width: 42,
  },
  customButton: {
    backgroundColor: "#8c2b2b",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginLeft: 5,
    marginRight: 5,
  },
  customButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  ratingText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 5,
  },

  flexRow: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
  },

  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: 300,
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
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

  containerFilter: {
    width: "100%",
    display: "flex",
    flexDirection: "row",
    backgroundColor: "white",
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
    fontWeight: "bold",
    color: "white",
    marginBottom: 10,
    alignSelf: "center",
  },
  cardContent: {
    fontSize: 14,
    color: "white",
  },
});
