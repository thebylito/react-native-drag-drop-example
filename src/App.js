import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  PanResponder,
  Animated,
  Dimensions,
  FlatList,
} from 'react-native';

const { height } = Dimensions.get('screen');

const items = [
  [
    { id: 'a', img: 'https://via.placeholder.com/150' },
    { id: 'b', img: 'https://via.placeholder.com/150' },
  ],
  [
    { id: 'c', img: 'https://via.placeholder.com/150' },
    { id: 'd', img: 'https://via.placeholder.com/150' },
  ],
  [
    { id: 'e', img: 'https://via.placeholder.com/150' },
    { id: 'f', img: 'https://via.placeholder.com/150' },
  ],
  [
    { id: 'g', img: 'https://via.placeholder.com/150' },
    { id: 'h', img: 'https://via.placeholder.com/150' },
  ],
];

function DraggableItem({ children, onItemPress, onItemRelease, anySelected }) {
  const viewRef = React.useRef();
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
        viewRef.current.setNativeProps({
          style: {
            zIndex: 999,
          },
        });
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
      ref={viewRef}
      onLongPress={() => setActive(true)}
      style={[
        panStyle,
        styles.circle,
        {
          zIndex: active ? 9999 : 0,
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
      <View style={{ flex: 1 }}>
        <FlatList
          scrollEnabled={scrollEnabled}
          style={{ flex: 1, paddingVertical: 150 }}
          data={items}
          horizontal={true}
          renderItem={({ item, index }) => (
            <View key={item[0].id}>
              <DraggableItem
                onItemPress={onPress}
                onItemRelease={onRelease}
                anySelected={scrollEnabled === false}>
                <Image
                  source={{ uri: item[0].img }}
                  style={{ width: 150, height: 150, margin: 5 }}
                />
              </DraggableItem>
              {item.length > 1 ? (
                <DraggableItem
                  onItemPress={onPress}
                  onItemRelease={onRelease}
                  anySelected={scrollEnabled === false}>
                  <Image
                    source={{ uri: item[1].img }}
                    style={{ width: 150, height: 150, margin: 5 }}
                  />
                </DraggableItem>
              ) : null}
            </View>
          )}
        />

        {/* <ScrollView
          horizontal
          scrollEnabled={scrollEnabled}
          style={{
            marginTop: 150,
            marginBottom: 150,
          }}>
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
        </ScrollView> */}
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
    zIndex: -1,
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
