
var React = require('react');
var StyleSheet = require('StyleSheet');

var Dimensions = require('Dimensions');
var View = require('View');
var ReactNative = require('react-native');
var {
    AppRegistry,
    Text,
    Image,
    Text,
    TouchableOpacity,
    Linking
    } = ReactNative;

var MomoReactToNative = require('../../native/MomoReactToNative');
var AuthenticationAPI = require("./AuthenticationAPI");
var MomoRoundTextInput = require('../../controls/MomoRoundTextInput');
var MoMoStrings = require('../MoMoStrings');
var MomoHelper = require('../../utils/MomoHelper');
var RegexUtils = require('../../utils/RegexUtils');

var TimerMixin = require('react-timer-mixin');
var FacebookAPI = require('../facebook/FacebookAPI');
var BEFacebookAPI = require('../facebook/BEFacebookAPI');

import BasicPopup from '../../root/popup/extendpopup/BasicPopup';
import PopupManager from '../../root/PopupManager';
import DeeplinkHandler from '../../root/handler/DeeplinkHandler';
import GenderPicker from './GenderPicker';

class Profile extends React.Component {
    state = {
            userName: this.props.parameters.userName ? this.props.parameters.userName : "",
            phone: this.props.parameters.phone ? this.props.parameters.phone : "",
            email:  this.props.parameters.email ? this.props.parameters.email : "",
            uriAvatar: null,
            isNamed: this.props.parameters.isNamed ? true : false,
            isLoginFacebook: false,
            errorUserName: "",
            errorEmail: "",
        };

    onChangeName = (text) => {
        this.setState({
            userName: text,
            errorUserName: ""
        })
    };

    onChangeEmail = (text) => {
        this.setState({
            email: text,
            errorEmail: "" 
        })
    };

    loginFacebook = async () => {
        let {type, token} = await FacebookAPI.logIn();
        if (type === 'success') {
            // this.syncWithFacebook();
            PopupManager.showLoading();
            let profile = await FacebookAPI.getProfile();
            PopupManager.hideLoading();
    
            if (profile && Object.keys(profile).length > 1) {
                BEFacebookAPI.uploadProfile(profile);
                this.setState({
                    userName: profile.name,
                    email: profile.email ? profile.email : '',
                    uriAvatar: profile.picture.data.url,
                    isLoginFacebook: true
                });
            }
            BEFacebookAPI.uploadToken(token);
        }
    };

    turnOffKeyBoard = () => {
        if (this.refs.name && this.refs.name.blur) {
            this.refs.name.blur();
        }

        if(this.refs.email && this.refs.email.blur){
            this.refs.email.blur();
        }
    };

    confirm = () => {
        MomoReactToNative.trackWithEvent("core_registration", {action: "click_confirm_scr_userinfo"});
        let {userName, email, isNamed} = this.state;
        let validUserName = userName && userName.toString().trim().length != 0
            || (isNamed == true || isNamed == "true");
        
        let errorUserNameMessage = validUserName ? "" : MoMoStrings.messageEnterFullname;

        let validEmail = RegexUtils.isValidEmailUnicode(email);    
        let errorEmailMessage = "";

        if (email && email.toString().trim().length == 0) {
            errorEmailMessage = MoMoStrings.messageEnterEmail;
        }
        else if (!validEmail) {
            errorEmailMessage = MoMoStrings.messageInvalidEmail;
        }
        
        if (!validEmail || !validUserName) {
            this.setState({
                errorEmail: errorEmailMessage,
                errorUserName: errorUserNameMessage
            });
        }
        else {
            this.turnOffKeyBoard();
            PopupManager.showLoading()
            //Update BE
            MomoReactToNative.getUserData((
                userId,
                avatar,
                name,
                isNamed,
                personalId,
                birthDate,
                email,
                address) => {
                    let updateName = this.state.userName.trim();
                    if (isNamed != this.state.isNamed) {
                        this.setState({
                            isNamed: isNamed                            
                        })
                        updateName = null;
                    }
                    AuthenticationAPI.updateProfile(updateName, this.state.email, (status, response) =>{
                        if(status) {
                            if (response && response.result) {
                                DeeplinkHandler.statePayment((statePayment)=>{
                                    if(!statePayment){
                                        MomoHelper.setAuthState("LOGGED");
                                        MomoHelper.emitEvent("CHANGE_STATE", "LOGGED");
                                    }
                                    MomoHelper.setBool("VerifyOTP", false);
                                });
                                MomoReactToNative.trackWithEvent("core_registration_info_success", {});
                                //Lê Hoàng bên PTSP yêu cầu để đây
                                MomoReactToNative.trackWithEvent("core_login_success",{});
                            }
                            else {
                                this.turnOffKeyBoard();
                                let buttons = [{text: 'ĐÓNG', type: 'close'}];
                                let body = response.errorDesc || 'Họ tên bạn vừa nhập có chứa từ ngữ không hợp lệ. Vui lòng kiểm tra lại.';
                                let popup = <BasicPopup body={body} buttons={buttons}/>;
                                PopupManager.showPopup(popup);
                                MomoReactToNative.trackWithEvent("core_registration", {stage: "userinfo_fail"});
                            }
                        }
                        else {
                            this.turnOffKeyBoard();
                            PopupManager.showConnectionErrorPopup();
                            MomoReactToNative.trackWithEvent("core_registration", {stage: "userinfo_fail"});
                        }
                        PopupManager.hideLoading()
                    })
                }
            );
        }
    };

    render() {
        return (
            <View style={{flex: 1, backgroundColor:"#b0006d",  paddingHorizontal: 40}}>
                <View style={{marginTop: 20, alignItems: 'center'}}>
                    {
                        this.state.isLoginFacebook ? 
                        <Image style={{ width: 50, height: 50, borderRadius: 25, marginBottom: 10 }} 
                            source={{uri: this.state.uriAvatar}}
                        /> : null
                    }
                    <Text style={{alignSelf:'center', marginTop: this.state.isLoginFacebook ? 8 : 28, fontSize: 18, fontWeight: '600',  color:'white',}}>
                        {MoMoStrings.profileInput}
                    </Text>
                    <Text style={{marginTop: 8, color: 'white', textAlign: 'center', fontSize: 14}}>
                        {MoMoStrings.profileMessage}
                    </Text>
                </View>

                <GenderPicker styleGenderPicker={{marginTop: 32, alignSelf: 'center'}}/>
                {
                    this.state.isNamed ? null :
                    <MomoRoundTextInput ref="name" style={{marginTop: 20}}
                        errorMessage={this.state.errorUserName}
                        textStyle={{color: '#4d4d4d', textAlign: 'center', fontSize: 20}}
                        placeholder={MoMoStrings.textEnterFullname2}
                        placeholderTextColor={"#929292"}
                        onChangeText={(userName) => this.onChangeName(userName)}
                        clearButton={true}
                        value={this.state.userName}
                        maxLength = {50}
                        autoFocus={true}
                        autoCapitalize={"words"}
                        onSubmitEditing={()=>{
                            if (this.refs.email && this.refs.email.focus) {
                                this.refs.email.focus();
                            } 
                        }}
                        onFocus={_=>{
                            this.setState({
                                errorUserName: ""
                            })
                            MomoReactToNative.trackWithEvent("core_registration", {action: "click_username_scr_userinfo"})
                        }}
                    />
                }                
                <MomoRoundTextInput ref="email" style={{marginTop: this.state.isNamed ? 20 : 10}}
                        errorMessage={this.state.errorEmail}
                        textStyle={{color: '#4d4d4d', textAlign: 'center', fontSize: 20}}
                        placeholder={MoMoStrings.textEnterEmail}
                        placeholderTextColor={"#929292"}
                        onChangeText={(email) => this.onChangeEmail(email)}
                        clearButton={true}
                        value={this.state.email}
                        maxLength = {50}
                        keyboardType={"email-address"}
                        autoCapitalize={"none"}
                        onFocus={_=>{
                            this.setState({
                                errorEmail: ""
                            })
                            MomoReactToNative.trackWithEvent("core_registration", {action: "click_useremail_scr_userinfo"})
                        }}                    />
                <TouchableOpacity style={{marginTop: 10,
                                        backgroundColor: "#8d015a",
                                        height: 50,
                                        borderRadius: 25,
                                        alignItems:'center',
                                        justifyContent:'center'}}
                        onPress={this.confirm}>
                    <Text style={{color: 'white',
                                    fontSize: 18,
                                    backgroundColor:'transparent',
                                    fontWeight: '600'}}>
                        {MoMoStrings.btnConfirm.toUpperCase()}
                    </Text>
                </TouchableOpacity>
                {
                    ! this.state.isLoginFacebook ?
                        <View style={{alignItems: 'center', marginTop: 20}}>
                            <TouchableOpacity
                                style={{flexDirection: 'row', justifyContent: 'center', alignItems: 'center'}}
                                onPress={() => this.loginFacebook()}>
                                <Image style={{width: 20, height: 20, resizeMode: 'contain', marginRight: 20}}
                                       source={require('../../common_img/ic_facebook_white.png')}/>
                                <Text style={{fontSize: 14, textAlign: 'center',color: '#FFFFFF'}}>
                                    {'Sử dụng thông tin Facebook'}
                                </Text>
                            </TouchableOpacity>
                        </View>
                        : null
                }
            </View>
        )
    }
}

module.exports = Profile;

