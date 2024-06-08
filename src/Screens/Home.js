import React, { useState, useRef, useEffect } from 'react';
import { View, Text, LogBox, StyleSheet, TouchableOpacity, Dimensions, Image, Platform } from 'react-native';
import MapView, { Marker, AnimatedRegion } from 'react-native-maps';
import { GOOGLE_MAP_KEY } from '../constants/googleMapKey';
import imagePath from '../constants/imagePath';
import MapViewDirections from 'react-native-maps-directions';
import Loader from '../components/Loader';
import { locationPermission, getCurrentLocation } from '../helper/helperFunction';
import * as Location from 'expo-location';
LogBox.ignoreLogs(['Warning: ...']); // Ignore log notification by message
LogBox.ignoreAllLogs();//Ignore all log notifications
const screen = Dimensions.get('window');
const ASPECT_RATIO = screen.width / screen.height;
const LATITUDE_DELTA = 0.04;
const LONGITUDE_DELTA = LATITUDE_DELTA * ASPECT_RATIO;

const Home = ({ navigation }) => {
    const mapRef = useRef()
    const markerRef = useRef()
    const [eventList, setEventList] = useState(null)
    const [eventList2, setEventList2] = useState(null)
    const [pickupnum, setpickupnum] = useState(0)
    const [dropoffnum, setdrop] = useState(0)
    const [Detialsofuser, setDetailsofuser] = useState();
    const [Detialsofuser2, setDetailsofuser2] = useState(null);
    const [latlonpickup, setlatlon] = useState([])
    
    const [Profileofclient, setProfileofclient] = useState("")
    const [Nameofclient, setNameofclient] = useState("");
    const [seatofclient, setseatofclient] = useState("");
    const [Detialsofbalance, setDetailsofbalance] = useState("");



    const B = (props) => <Text style={{ fontWeight: 'bold' }}>{props.children}</Text>

    const [state, setState] = useState({
        curLoc: {
            latitude: 33.7747826,
            longitude: 72.699295,

        },
        destinationCords: {},
        isLoading: false,
        coordinate: new AnimatedRegion({
            latitude: 30.7046,
            longitude: 77.1025,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        }),
        time: 0,
        distance: 0,
        heading: 0

    })

    const { curLoc, time, distance, destinationCords, isLoading, coordinate, heading } = state
    const updateState = (data) => setState((state) => ({ ...state, ...data }));
    const dataofclients = async (id) => {
        const ip = await AsyncStorage.getItem('@Data_Ip')
        const ip_add = JSON.parse(ip)

        fetch('http://' + ip_add['ip'] + '/api/Customer/' + id, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setDetailsofuser(responseJson)
            })
            .catch((error) => {
                console.error(error);
            });

    }

    const Shedule = async () => {
        fetch('http://192.168.1.14/api/CheckPickDrop/5', {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                console.log(responseJson)
                setEventList(responseJson['Pickup'])
                setEventList2(responseJson['Dropoff'])
                Sheduledetails(responseJson['Pickup'][pickupnum])
                setpickupnum(pickupnum+1)

            })
            .catch((error) => {
                console.error(error);
            });

    }
    const Sheduledetails = async (id) => {
        fetch('http://192.168.1.14/api/FinalCarpool/' + id, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                
                
                setDetailsofuser(responseJson['client_id'])
                setseatofclient(responseJson['seat'])

                setlatlon({
                    "lat": responseJson['lat'],
                    "long": responseJson['long'],
                    
                })
                Getuserdetails(responseJson['client_id'])
                fetchValue({
                    "lat": responseJson['lat'],
                    "long": responseJson['long'],
                    
                })
                
            })
            .catch((error) => {
                console.error(error);
            });

    }
    const Getuserdetails = async (id) => {
        fetch('http://192.168.1.14/api/Customer/' + id, {
            method: 'GET'
        })
            .then((response) => response.json())
            .then((responseJson) => {
                setDetailsofbalance(responseJson["phone"])
                setNameofclient(responseJson["username"])
                setProfileofclient(responseJson["Profile"])
            
            })
            .catch((error) => {
                console.error(error);
            });

    }


    useEffect(() => {
        
        Shedule()
        try {
            getLiveLocation()

          }
          catch(err) {
           
            getLiveLocation()
          }


    }, [])

    const getLiveLocation = async () => {
        try {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Permission to access location was denied');
                return;
            }

            let location = await Location.getCurrentPositionAsync({});
            const latitude = location.coords.latitude
            const longitude = location.coords.longitude
            const heading = location.coords.heading
            console.log("get live location after 4 second", heading)
            animate(latitude, longitude);
            updateState({
                heading: heading,
                curLoc: { latitude, longitude },
                coordinate: new AnimatedRegion({
                    latitude: latitude,
                    longitude: longitude,
                    latitudeDelta: LATITUDE_DELTA,
                    longitudeDelta: LONGITUDE_DELTA
                })
            })
        } catch (error) {
            console.log(error);
        }
    }

    useEffect(() => {
        const interval = setInterval(() => {
            getLiveLocation()
        }, 2000);
        return () => clearInterval(interval)
    }, [])


   
    const fetchValue = (data) => {
        updateState({
            destinationCords: {
                latitude: data.lat,
                longitude: data.long
            }
        })
    }


    const animate = (latitude, longitude) => {
        const newCoordinate = { latitude, longitude };
        if (Platform.OS == 'android') {
            if (markerRef.current) {
                markerRef.current.animateMarkerToCoordinate(newCoordinate, 7000);
            }
        } else {
            coordinate.timing(newCoordinate).start();
        }
    }

    const onCenter = () => {
        mapRef.current.animateToRegion({
            latitude: curLoc.latitude,
            longitude: curLoc.longitude,
            latitudeDelta: LATITUDE_DELTA,
            longitudeDelta: LONGITUDE_DELTA
        })
    }

    const fetchTime = (d, t) => {
        if (d ==0) {
            if (eventList.length!=pickupnum)
                {
                    Sheduledetails(eventList[2])
                    setpickupnum(pickupnum+1)
                }
            else if(eventList2.length==dropoffnum){
                Sheduledetails(eventList[dropoffnum])
                setdrop(dropoffnum+1)


            }
            
        }
        else {
            updateState({
                distance: d,
                time: t
            })
        }
    }








    return (
        <View style={styles.container}>




            <View style={styles.header}>
                <Image source={{ uri: Profileofclient }} style={styles.circle} />
                <View style={styles.informationContainer}>
                    <Text style={styles.label}><B>Name:</B> {Nameofclient}</Text>
                    <Text style={styles.label}><B>Phone: </B> {Detialsofbalance}</Text>
                    <Text style={styles.label}><B>Total Seat: </B> {seatofclient}</Text>
                    {distance !== 0 && time !== 0 && (
                        <View style={{ alignItems: 'center', marginVertical: 15, marginLeft: -80, }}>
                            <Text style={{ color: 'white' }}>Time left:  {time.toFixed(2)} Mints</Text>
                            <Text style={{ color: 'white', marginTop: 10 }}>Distance left: {distance.toFixed(2)} Km</Text>
                        </View>)}
                </View>
            </View>
            <View style={{ flex: 1 }}>
                <MapView
                    ref={mapRef}
                    style={StyleSheet.absoluteFill}
                    initialRegion={{
                        ...curLoc,
                        latitudeDelta: LATITUDE_DELTA,
                        longitudeDelta: LONGITUDE_DELTA,
                    }}
                >

                    <Marker.Animated
                        ref={markerRef}
                        coordinate={coordinate}
                    >
                        <Image
                            source={imagePath.icBike}
                            style={{
                                width: 40,
                                height: 40,
                                transform: [{ rotate: `${heading}deg` }]
                            }}
                            resizeMode="contain"
                        />
                    </Marker.Animated>

                    {Object.keys(destinationCords).length > 0 && (<Marker
                        coordinate={destinationCords}
                        image={imagePath.icGreenMarker}
                    />)}

                    {Object.keys(destinationCords).length > 0 && (<MapViewDirections
                        origin={curLoc}
                        destination={destinationCords}
                        apikey={GOOGLE_MAP_KEY}
                        strokeWidth={6}
                        strokeColor="red"
                        optimizeWaypoints={true}
                        onStart={(params) => {
                            console.log(`Started routing between "${params.origin}" and "${params.destination}"`);
                        }}
                        onReady={result => {
                            console.log(`Distance: ${result.distance} km`)
                            console.log(`Duration: ${result.duration} min.`)
                            fetchTime(result.distance, result.duration),
                                mapRef.current.fitToCoordinates(result.coordinates, {
                                    edgePadding: {
                                        // right: 30,
                                        // bottom: 300,
                                        // left: 30,
                                        // top: 100,
                                    },
                                });
                        }}
                        onError={(errorMessage) => {
                            // console.log('GOT AN ERROR');
                        }}
                    />)}
                </MapView>
                <TouchableOpacity
                    style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0
                    }}
                    onPress={onCenter}
                >
                    <Image source={imagePath.greenIndicator} />
                </TouchableOpacity>
            </View>

            <Loader isLoading={isLoading} />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    bottomCard: {
        backgroundColor: 'white',
        width: '100%',
        padding: 30,
        borderTopEndRadius: 24,
        borderTopStartRadius: 24
    },
    inpuStyle: {
        backgroundColor: 'white',
        borderRadius: 4,
        borderWidth: 1,
        alignItems: 'center',
        height: 48,
        justifyContent: 'center',
        marginTop: 16
    },
    header: {
        backgroundColor: '#696969',
        height: 200,
        flexDirection: 'row',
        alignItems: 'center',
        paddingTop: 20,
        paddingHorizontal: 16,
        borderRadius: 35
    },

    circle: {
        borderRadius: 25,
        height: 50,
        width: 50,
        marginTop: -80,
        backgroundColor: "#fff"
    },
    informationContainer: {
        width: 250,
        height: 150,
        marginLeft: 20,
    },
    name: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff'
    },
    label: {
        fontSize: 15,
        color: '#ffffff',
        marginTop: 10,
    },
    section: {
        paddingHorizontal: 16,
        marginVertical: 5,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 10,
    },
    sectionTitle: {
        fontSize: 18,
    },
    seeAllButton: {
        backgroundColor: '#A9A9A9',
        padding: 5,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 4,
    },
    seeAllButtonText: {
        color: '#eee'
    },
    sectionBody: {
        marginTop: 10,
    },
    sectionScroll: {
        paddingBottom: 20,
    },
    sectionCard: {
        width: 200,
        minHeight: 200,
        backgroundColor: '#fff',
        shadowColor: '#B0C4DE',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 2,
        elevation: 1,
        margin: 10,
        backgroundColor: '#fff',
        borderRadius: 6,
    },
    sectionImage: {
        width: '100%',
        aspectRatio: 1,
    },
    sectionInfo: {
        padding: 10,
    },
    sectionLabel: {
        fontSize: 12,
        marginBottom: 2,
    },
});

export default Home;
