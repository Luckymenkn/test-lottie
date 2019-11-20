import React from 'react';
import {View, TouchableOpacity, StyleSheet, Text, Image} from 'react-native';
// Gender:
// 0: default
// 1: nữ
// 2: nam

class GenderPicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            gender: this.props.gender ? this.props.gender : 0,
        }
    }

    componentDidMount() {
        
    }

    _onFemalePress = () => {
        this.setState({
            gender: 1,
        })
    }

    renderFemaleGender() {
        let isFemale = (this.state.gender == 1);
        return (
            <TouchableOpacity style={[styles.female, {backgroundColor: isFemale ? '#ff87a1' : '#fff'}]} onPress={this._onFemalePress}>
                <Image 
                    style={{width: 32, height: 32, resizeMode: 'contain'}} 
                    source={isFemale ? require('../../common_img/ic_gender_female.png') : require('../../common_img/ic_gender_female.png')}
                />
    <Text style={[{color: isFemale ? '#fff' : '#bec4cf'}]}>{'Nữ'}</Text>
            </TouchableOpacity>
        )
    }

    renderDivider() {
        return (
            <View style={styles.divider}/>
        )
    }

    _onMalePress = () => {
        this.setState({
            gender: 2,
        })
    }

    renderMaleRender() {
        let isMale = (this.state.gender == 2);
        return (
            <TouchableOpacity style={[styles.male, {backgroundColor: isMale ? '#1ac2ff' : '#fff'}]} onPress = {this._onMalePress}>
                <Image 
                    style={{width: 32, height: 32, resizeMode: 'contain'}} 
                    source={isMale ? require('../../common_img/ic_gender_male.png') : require('../../common_img/ic_gender_male.png')}
                />
                <Text style={[{color: isMale ? '#fff' : '#bec4cf'}]}>{'Nam'}</Text>
            </TouchableOpacity>
        )
    }

    render() {
        return (
            <View style={[this.props.styleGenderPicker, styles.container]}>
                {this.renderFemaleGender()}
                {this.state.gender == 0 && this.renderDivider()}
                {this.renderMaleRender()}
            </View>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        height: 48,
        borderRadius: 24
    },
    female: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopLeftRadius: 24,
        borderBottomLeftRadius: 24,
        height: 48,
        width: 100
    }, 
    male: {
        flexDirection: 'row',
        alignSelf: 'stretch',
        alignItems: 'center',
        justifyContent: 'center',
        borderTopRightRadius: 24,
        borderBottomRightRadius: 24,
        height: 48,
        width: 100
    },
    divider: {
        backgroundColor: '#000',
        paddingVertical: 8,
        alignSelf: 'stretch',
        width: 1,
        paddingVertical: 8
    }
})

// class Gender extends React.Component {
//     constructor(props) {
//         super()
//         this.state = {
//             isSelected: this.props.isSelected ? this.props.isSelected : false,
//         }
//     }

//     componentDidMount() {

//     }

//     render() {
//         return (
//             <View style={[this.props.genderStyle, {backgroundColor: this.props.isSelected ? }]}>
                
//             </View>
//         )
//     }
// }

// const styles = StyleSheet.create({

// })

module.exports = GenderPicker