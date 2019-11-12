import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  PanResponder,
  Animated,
  Dimensions,
  FlatList,
  ScrollView,
  Image,
  TouchableOpacity,
} from 'react-native';

const { height } = Dimensions.get('screen');

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

const items = [
  { id: 'a', img: 'https://via.placeholder.com/150' },
  { id: 'b', img: 'https://via.placeholder.com/150' },
  { id: 'c', img: 'https://via.placeholder.com/150' },
  { id: 'd', img: 'https://via.placeholder.com/150' },
  { id: 'e', img: 'https://via.placeholder.com/150' },
  { id: 'f', img: 'https://via.placeholder.com/150' },
  { id: 'g', img: 'https://via.placeholder.com/150' },
  { id: 'h', img: 'https://via.placeholder.com/150' },
];

function DraggableItem({ children, onItemPress, onItemRelease, anySelected }) {
  const panRef = React.useRef(new Animated.ValueXY());
  const scaleRef = React.useRef(new Animated.Value(1));
  const [active, setActive] = React.useState(false);

  React.useEffect(() => {
    Animated.timing(scaleRef.current, {
      toValue: active ? 1.2 : 1,
      duration: 100,
    }).start();
  }, [active]);

  const onPanResponderGrant = (e, gesture) => {
    onItemPress();
    setActive(true);
    // console.log('onPanResponderGrant');
    panRef.current.setOffset({
      x: panRef.current.x._value,
      y: panRef.current.y._value,
    });
    panRef.current.setValue({ x: 0, y: 0 });
  };

  const onPanResponderMove =
    active &&
    Animated.event([null, { dx: panRef.current.x, dy: panRef.current.y }]);

  const onPanResponderRelease = (e, gesture) => {
    setActive(false);

    //console.log(gesture);
    if (isDropArea(gesture)) {
      Animated.spring(panRef.current, {
        toValue: { x: 0, y: 0 },
      }).start();
      console.log('Drop com sucesso');
    } else {
      Animated.spring(panRef.current, {
        toValue: { x: 0, y: 0 },
      }).start();
    }

    onItemRelease();
    panRef.current.flattenOffset();
  };

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => active,
    onMoveShouldSetPanResponderCapture: (e, gestureState) => {
      // Only capture when moving vertically, this helps for child swiper rows.
      const vy = Math.abs(gestureState.vy);
      const vx = Math.abs(gestureState.vx);
      if (vy > vx + 0.3 || active) {
        setActive(true);
        return true;
      }
      return false;
    },
    onPanResponderGrant: onPanResponderGrant,
    onPanResponderRelease: onPanResponderRelease,
    onPanResponderMove: onPanResponderMove,
    onPanResponderEnd: () => setActive(false),
  });

  const isDropArea = gesture => {
    console.log(gesture.moveY);
    return gesture.moveY > height - 150;
  };

  const panStyle = {
    transform: [
      ...panRef.current.getTranslateTransform(),
      { scale: scaleRef.current },
    ],
  };

  return (
    <Animated.View
      style={[
        panStyle,
        styles.circle,
        {
          zIndex: active && 9,
          backgroundColor: active ? 'green' : 'red',
          width: 150,
          height: 150,
          opacity: anySelected ? (active ? 1 : 0.6) : 1,
        },
      ]}
      {...panResponder.panHandlers}>
      {children}
    </Animated.View>
  );
}

export default function App() {
  const [scrollEnabled, setScrollEnabled] = React.useState(true);

  const onPress = () => setScrollEnabled(false);
  const onRelease = () => setScrollEnabled(true);

  return (
    <View style={styles.mainContainer}>
      <View style={styles.dropZone}>
        <Text style={styles.text}>Drop them here!</Text>
      </View>
      <View style={styles.ballContainer} />
      <View style={styles.row}>
        <ScrollView horizontal scrollEnabled={scrollEnabled}>
          {items.map(item => (
            <View style={{ margin: 5 }} key={item.id}>
              <DraggableItem
                onItemPress={onPress}
                onItemRelease={onRelease}
                anySelected={scrollEnabled === false}>
                <Image
                  source={{ uri: item.img }}
                  style={{ width: 150, height: 150 }}
                />
              </DraggableItem>
            </View>
          ))}
        </ScrollView>
        {/* <FlatList
          scrollEnabled={scrollEnabled}
          data={items}
          horizontal
          keyExtractor={item => item.id}
          renderItem={({ item }) => (
            <DraggableItem
              key={item.id}
              onItemPress={onPress}
              onItemRelease={onRelease}>
              <Image
                source={{ uri: item.img }}
                style={{ width: 150, height: 150 }}
              />
            </DraggableItem>
          )}
        /> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  ballContainer: {
    height: 200,
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  dropZone: {
    position: 'absolute',
    bottom: 0,
    alignSelf: 'center',
    width: '100%',
    height: 150,
    backgroundColor: '#00334d',
  },
  text: {
    marginTop: 25,
    marginLeft: 5,
    marginRight: 5,
    textAlign: 'center',
    color: '#fff',
    fontSize: 25,
    fontWeight: 'bold',
  },
});
