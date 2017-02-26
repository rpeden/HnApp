/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  AppRegistry,
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  WebView
} from 'react-native';
import { getStories } from './story-grabber/story-grabber.js';

const Button = (props) => {
  const hmm = props;
  return (
  <TouchableOpacity style={styles.buttonView} onPress={props.onClick}>
    <Text>{props.text}</Text>
  </TouchableOpacity>);
}


class Menu extends Component {
  render() {
    <View style={styles.menu}>
        <Text style={styles.lightText}>hi</Text>
        <Button text="Testing" style={styles.buttonView} onClick={this.updateText.bind(this)} />
    </View>
  }
}

class HnApp extends Component {
  constructor() {
    super();
    this.state = {
      text: "hi there"
    }
  }

  updateText() {
    /*this.setState({
      text: "updated"
    })*/
    this.setState({
      text: "loading..."
    });
    getStories().then((res) => {
      var stories = res[0].stories.map((s) => s.title).join("\n");
      this.setState({
        text: stories
      });
    })
  }

  render() {
    return (
      <View style={styles.window}>
        <View style={styles.menu}>
          <Text style={styles.lightText}>hi</Text>
          <Button text="Load" onClick={this.updateText.bind(this)} />
        </View>
        <View style={styles.container}>
          <WebView style={{height: 300, width: 500}} source={{uri: 'https://www.cbc.ca'}} />
          <Text>
            {this.state.text}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  buttonView: {
    width: 150,
    paddingTop: 5,
    paddingBottom: 5, 
    paddingLeft: 10, 
    paddingRight: 10,
    backgroundColor: '#bbb'
  },
  menu: {
    width: 250,
    backgroundColor: '#202020'
  },
  lightText: {
    color: 'white'
  },
  window: {
    flex: 1, 
    flexDirection: 'row'
  },
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5FCFF',
  },
  welcome: {
    fontSize: 20,
    textAlign: 'center',
    margin: 10,
  },
  instructions: {
    textAlign: 'center',
    color: '#333333',
    marginBottom: 5,
  },
});

AppRegistry.registerComponent('HnApp', () => HnApp);