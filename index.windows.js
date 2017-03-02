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
  TouchableHighlight,
  Button as Bttn,
  WebView,
  ScrollView,
  NativeModules,
  Navigator
} from 'react-native';

import { getStories } from './story-grabber/story-grabber.js';
import { fetchAndProcessPage } from './page-processor/page-processor.js';

const Button = (props) => {
  const hmm = props;
  return (
  <TouchableOpacity style={styles.buttonView} onPress={props.onClick}>
    <Text>{props.text}</Text>
  </TouchableOpacity>);
}

const TitleBar = ({title}) => {
  const titleStyle = {
    alignSelf: 'stretch',
    backgroundColor: '#ccc',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5
  };

  return (
    <View style={titleStyle}>
      <Text style={{fontSize: 20}}>{title}</Text>
    </View>
  )
}

const HNStory = ({storyTitle, domain, hovered, onEnter, onPress}) => {
  const storyStyle = {
    flexDirection: 'column',

    backgroundColor: '#f2f2f2',
    paddingTop: 10,
    paddingBottom: 10,
    paddingLeft: 5,
    borderColor: '#bbb',
    borderBottomWidth: 1
  }

  const hoverStyle = {
    backgroundColor: '#e2e2e2'
  };

  const titleStyle = {
    fontSize: 18
  }

  var style = storyStyle;
  if(hovered) {
    style = [storyStyle, hoverStyle]
  }
  return (
      <View style={style} onMouseEnter={onEnter}>
        <TouchableOpacity onPress={onPress}>
          <Text style={titleStyle}>{storyTitle}</Text>
          <Text>{domain}</Text>
          <Text>{hovered && hovered.toString() || "no"}</Text>
        </TouchableOpacity>
      </View>
  )
}

class Menu extends Component {
  render() {
    <View style={styles.menu}>
        <Text style={styles.lightText}>hi</Text>
        <Button text="Testing" style={styles.buttonView} onClick={this.updateText.bind(this)} />
    </View>
  }
}

let navigator = undefined;

class Stories extends Component {
  constructor() {
    super();
    this.state = {
      text: "hi there",
      stories: [], 
      hovered: "nothing",
      hoveredIndex: 0
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
      var rawStories = res[0].stories;
      var stories = rawStories.map((s) => s.title).join("\n");
      this.setState({
        text: stories,
        stories: rawStories
      });
    })
  }

  componentWillMount() {
    this.updateText();
    navigator = this.props.navigator;
  }

  updateHover(title) {
    this.setState({
      hovered: title
    });
  }

  updateHoverIndex(idx) {
    this.setState({
      hoveredIndex: idx
    })
  }

  handlePress(address) {
    const navigator = this.props.navigator;
    fetchAndProcessPage(address).then(pageHtml => {
      navigator.push({
        title: 'Web',
        content: pageHtml,
        nextIndex: this.props.nextIndex
      });
    }) 
  }

  renderStories() {
    return (
      <ScrollView showsVerticalScrollIndicator={true} style={{alignSelf: 'stretch'}}>
        {this.state.stories.map((s, idx) => <HNStory storyTitle={s.title} 
                                                     onEnter={this.updateHoverIndex.bind(this,idx)} 
                                                     hovered={idx == this.state.hoveredIndex} 
                                                     onLeave={this.updateHoverIndex.bind(this,null)} 
                                                     domain={s.domain} 
                                                     key={idx} 
                                                     onPress={this.handlePress.bind(this, s.address)}/>)}
      </ScrollView>
    );
  }

  render() {
    return (
      <View style={styles.window}>
        
        <View style={styles.container}>
          <TitleBar title="Homepage" />
          {this.renderStories()}
        </View>
        
      </View>
    );
  }
}

class PageView extends Component {
  render() {
    return (
      <WebView source={{ html: this.props.content }} />
    );
  }
}

class HnApp extends Component {
  render() {
    return (
      <View style={styles.window}>
        <View style={styles.menu}>
          <Text style={styles.lightText}>hi</Text>
          <Button onPress={() => navigator.pop()}>Back</Button>
        </View>
        <Navigator
            initialRoute={{ title: 'Stories', index: 0 }}
            renderScene={(route, navigator) => {
                index = route.index;
                mainNavigator = navigator;
                switch(route.title) {
                    case 'Stories':
                        return <Stories nextIndex={route.index + 1} navigator={navigator} />;
                        break;
                    case 'Web':
                        return <PageView content={route.content}
                                         nextIndex={route.index + 1} 
                                         navigator={navigator}/>;
                        break;
                }
      }}/>
    </View>
    )
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
    justifyContent: 'flex-start',
    alignItems: 'flex-start',
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