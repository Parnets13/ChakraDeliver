import React, {useState, useRef} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, ActivityIndicator,
  Platform, KeyboardAvoidingView, Modal,
  PermissionsAndroid,
} from 'react-native';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import IconMC from 'react-native-vector-icons/MaterialCommunityIcons';
import {COLORS} from '../theme/colors';
import api from '../api/config';

const ACCENT = COLORS.WARNING;

function Divider({title}) {
  return (
    <View style={S.divRow}>
      <View style={S.divLine} />
      <Text style={S.divTxt}>{title}</Text>
      <View style={S.divLine} />
    </View>
  );
}

function Lbl({text, required}) {
  return (
    <Text style={S.lbl}>
      {text}{required ? <Text style={S.star}> *</Text> : null}
    </Text>
  );
}

function Err({msg}) {
  return msg ? <Text style={S.err}>{msg}</Text> : null;
}

export default function DeliveryLogisticsRegistrationScreen({navigation}) {
  const scrollRef = useRef(null);
  const [loading,     setLoading]     = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photo,    setPhoto]    = useState(null);
  const [showPwd,  setShowPwd]  = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);

  const [form, setFormState] = useState({
    fullName:'', mobileNumber:'', email:'',
    password:'', confirmPassword:'',
    drivingLicence:'', vehicleNumber:'',
  });
  const [E, setE] = useState({});

  const upd = (k, v) => {
    setFormState(p => ({...p, [k]: v}));
    setE(p => ({...p, [k]: ''}));
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim())         e.fullName        = 'Full name is required';
    if (!form.mobileNumber.trim())     e.mobileNumber    = 'Required';
    else if (!/^\d{10}$/.test(form.mobileNumber)) e.mobileNumber = 'Enter 10-digit number';
    if (!form.email.trim())            e.email           = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email';
    if (!form.password)                e.password        = 'Required';
    else if (form.password.length < 6) e.password        = 'Min 6 characters';
    if (!form.confirmPassword)         e.confirmPassword = 'Required';
    else if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';
    if (!form.drivingLicence.trim())   e.drivingLicence  = 'Driving licence is required';
    if (!form.vehicleNumber.trim())    e.vehicleNumber   = 'Vehicle number is required';
    setE(e);
    return Object.keys(e).length === 0;
  };

  const IMAGE_OPTIONS = {
    mediaType: 'photo',
    quality: 0.7,
    maxWidth: 800,
    maxHeight: 800,
    saveToPhotos: false,
    includeBase64: false,
    selectionLimit: 1,
  };

  const openCamera = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs camera access to take your profile photo.',
            buttonPositive: 'Allow',
            buttonNegative: 'Deny',
          },
        );
        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Alert.alert('Permission Denied', 'Camera permission is required to take photos.');
          return;
        }
      } catch (err) {
        console.warn('Camera permission error:', err);
        return;
      }
    }
    launchCamera({...IMAGE_OPTIONS, cameraType: 'back'}, onPick);
  };

  const openGallery = () => {
    launchImageLibrary(IMAGE_OPTIONS, onPick);
  };

  const pickPhoto = () =>
    Alert.alert('Profile Photo', 'Choose source', [
      {text: 'Camera',  onPress: openCamera},
      {text: 'Gallery', onPress: openGallery},
      {text: 'Cancel',  style: 'cancel'},
    ]);

  const onPick = res => {
    if (res.didCancel || res.errorCode) return;
    const a = res.assets?.[0];
    if (a) setPhoto({uri: a.uri, type: a.type || 'image/jpeg', fileName: a.fileName || `dlv_${Date.now()}.jpg`});
  };

  const submit = async () => {
    if (!validate()) { scrollRef.current?.scrollTo({y:0,animated:true}); return; }
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('fullName',       form.fullName);
      fd.append('mobileNumber',   form.mobileNumber);
      fd.append('email',          form.email);
      fd.append('password',       form.password);
      fd.append('drivingLicence', form.drivingLicence.toUpperCase());
      fd.append('vehicleNumber',  form.vehicleNumber.toUpperCase());
      fd.append('userRole',       'delivery_logistics');
      fd.append('department',     'Delivery Logistics');
      fd.append('designation',    'Delivery Agent');
      fd.append('joiningDate',    new Date().toISOString().split('T')[0]);
      if (photo) fd.append('profilePhoto', {uri:photo.uri, type:photo.type, name:photo.fileName});
      await api.post('/employees/register', fd, {headers:{'Content-Type':'multipart/form-data'}});
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.replace('Login');
      }, 3000);
    } catch (err) {
      const serverMsg = err?.response?.data?.message || err.message || 'Something went wrong. Please try again.';
      Alert.alert('Registration Failed', serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={S.root} behavior={Platform.OS==='ios'?'padding':'height'}>

      {/* Header */}
      <View style={S.header}>
        <TouchableOpacity style={S.backBtn} onPress={()=>navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={COLORS.WHITE} />
        </TouchableOpacity>
        <View style={S.hMid}>
          <Image
            source={require('../assets/logo.png')}
            style={S.logo}
            resizeMode="contain"
          />
          <Text style={S.hTitle}>Delivery Registration</Text>
          <Text style={S.hSub}>Sri Chakra Industries</Text>
        </View>
        <View style={{width:38}} />
      </View>

      <ScrollView
        ref={scrollRef}
        contentContainerStyle={S.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ════════════════════════════════════════
            SINGLE CARD — all fields inside
        ════════════════════════════════════════ */}
        <View style={S.card}>

          {/* ── Personal ── */}
          <Divider title="Personal Information" />

          <Lbl text="Full Name" required />
          <View style={[S.iRow, E.fullName && S.iErr]}>
            <Icon name="user" size={15} color={COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="e.g. Rahul Singh"
              placeholderTextColor="#C0C0C0"
              value={form.fullName} onChangeText={v=>upd('fullName',v)} />
          </View>
          <Err msg={E.fullName} />

          <Lbl text="Mobile Number" required />
          <View style={[S.phoneRow, E.mobileNumber && S.iErr]}>
            <View style={S.countryBox}>
              <Text style={S.flag}>🇮🇳</Text>
              <Text style={S.cc}>+91</Text>
            </View>
            <TextInput style={S.phoneTxt} placeholder="10-digit number"
              placeholderTextColor="#C0C0C0" keyboardType="phone-pad"
              value={form.mobileNumber} onChangeText={v=>upd('mobileNumber',v)} maxLength={10} />
          </View>
          <Err msg={E.mobileNumber} />

          <Lbl text="Email ID" required />
          <View style={[S.iRow, E.email && S.iErr]}>
            <Icon name="mail" size={15} color={COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="e.g. rahul@company.com"
              placeholderTextColor="#C0C0C0" keyboardType="email-address"
              autoCapitalize="none"
              value={form.email} onChangeText={v=>upd('email',v)} />
          </View>
          <Err msg={E.email} />

          {/* ── Security ── */}
          <Divider title="Account Security" />

          <Lbl text="Password" required />
          <View style={[S.iRow, E.password && S.iErr]}>
            <Icon name="lock" size={15} color={COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="Min 6 characters"
              placeholderTextColor="#C0C0C0" secureTextEntry={!showPwd}
              value={form.password} onChangeText={v=>upd('password',v)} />
            <TouchableOpacity onPress={()=>setShowPwd(p=>!p)} style={S.eye}>
              <Icon name={showPwd?'eye-off':'eye'} size={17} color={COLORS.MUTED} />
            </TouchableOpacity>
          </View>
          <Err msg={E.password} />

          <Lbl text="Confirm Password" required />
          <View style={[S.iRow, E.confirmPassword && S.iErr]}>
            <Icon name="shield" size={15} color={COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="Re-enter password"
              placeholderTextColor="#C0C0C0" secureTextEntry={!showCPwd}
              value={form.confirmPassword} onChangeText={v=>upd('confirmPassword',v)} />
            <TouchableOpacity onPress={()=>setShowCPwd(p=>!p)} style={S.eye}>
              <Icon name={showCPwd?'eye-off':'eye'} size={17} color={COLORS.MUTED} />
            </TouchableOpacity>
          </View>
          <Err msg={E.confirmPassword} />

          {/* ── Vehicle ── */}
          <Divider title="Vehicle Details" />

          <Lbl text="Driving Licence Number" required />
          <View style={[S.iRow, E.drivingLicence && S.iErr]}>
            <IconMC name="card-account-details-outline" size={16} color={COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="e.g. MH1220110012345"
              placeholderTextColor="#C0C0C0" autoCapitalize="characters"
              value={form.drivingLicence}
              onChangeText={v=>upd('drivingLicence',v.toUpperCase())} />
          </View>
          <Err msg={E.drivingLicence} />

          <Lbl text="Vehicle Number" required />
          <View style={[S.iRow, E.vehicleNumber && S.iErr]}>
            <IconMC name="truck-outline" size={16} color={COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="e.g. MH12AB1234"
              placeholderTextColor="#C0C0C0" autoCapitalize="characters"
              value={form.vehicleNumber}
              onChangeText={v=>upd('vehicleNumber',v.toUpperCase())} />
          </View>
          <Err msg={E.vehicleNumber} />

          {/* ── Profile Photo ── */}
          <Divider title="Profile Photo" />

          <View style={S.photoArea}>
            <TouchableOpacity style={[S.photoCircle,{borderColor:ACCENT}]} onPress={pickPhoto} activeOpacity={0.85}>
              {photo
                ? <Image source={{uri:photo.uri}} style={S.photoImg} />
                : (
                  <View style={[S.photoEmpty,{backgroundColor:'#FFF3E0'}]}>
                    <Icon name="camera" size={26} color={ACCENT} />
                    <Text style={[S.photoTxt,{color:ACCENT}]}>Add Photo</Text>
                  </View>
                )
              }
            </TouchableOpacity>
            {photo && (
              <TouchableOpacity onPress={()=>setPhoto(null)} style={S.removeBtn}>
                <Icon name="x-circle" size={13} color={COLORS.FAILED} />
                <Text style={S.removeTxt}>Remove</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>{/* end card */}

        {/* Submit */}
        <TouchableOpacity
          style={[S.submitBtn, loading&&{opacity:0.55}]}
          onPress={submit} disabled={loading} activeOpacity={0.85}>
          {loading
            ? <ActivityIndicator color={COLORS.WHITE} />
            : <><Icon name="check-circle" size={18} color={COLORS.WHITE}/><Text style={S.submitTxt}>Create Account</Text></>
          }
        </TouchableOpacity>

        <TouchableOpacity style={S.loginRow} onPress={()=>navigation.replace('Login')}>
          <Text style={S.loginTxt}>
            Already have an account? <Text style={[S.loginBold,{color:ACCENT}]}>Login</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const S = StyleSheet.create({
  root:   {flex:1, backgroundColor:'#F1F3F8'},

  header: {
    flexDirection:'row', alignItems:'center',
    backgroundColor:COLORS.PRIMARY,
    paddingTop:Platform.OS==='android'?14:12,
    paddingBottom:14, paddingHorizontal:14,
    elevation:5,
    shadowColor:COLORS.PRIMARY, shadowOffset:{width:0,height:3}, shadowOpacity:0.25, shadowRadius:6,
  },
  backBtn:{width:38,height:38,borderRadius:19,backgroundColor:'rgba(255,255,255,0.2)',alignItems:'center',justifyContent:'center'},
  hMid:   {flex:1, alignItems:'center'},
  hTitle: {fontSize:15, fontWeight:'800', color:COLORS.WHITE},
  hSub:   {fontSize:10, color:'rgba(255,255,255,0.75)', marginTop:1},
  logo: {
    width: 130,
    height: 55,
    marginBottom: 6,
    borderRadius: 16,
    backgroundColor: COLORS.WHITE,
    padding: 4,
  },

  body: {padding:14, paddingBottom:40},

  /* Single card */
  card: {
    backgroundColor:COLORS.WHITE,
    borderRadius:18,
    paddingHorizontal:16,
    paddingTop:6,
    paddingBottom:20,
    elevation:3,
    shadowColor:'#000', shadowOffset:{width:0,height:2}, shadowOpacity:0.08, shadowRadius:8,
  },

  /* Section divider */
  divRow:  {flexDirection:'row', alignItems:'center', marginTop:20, marginBottom:4},
  divLine: {flex:1, height:1, backgroundColor:COLORS.BORDER},
  divTxt:  {fontSize:11, fontWeight:'800', color:COLORS.MUTED, paddingHorizontal:10, letterSpacing:0.8, textTransform:'uppercase'},

  /* Labels */
  lbl:  {fontSize:12, fontWeight:'700', color:COLORS.TEXT, marginTop:12, marginBottom:5},
  star: {color:COLORS.FAILED},
  err:  {fontSize:11, color:COLORS.FAILED, fontWeight:'600', marginTop:3},

  /* Icon input */
  iRow: {flexDirection:'row', alignItems:'center', backgroundColor:COLORS.BG, borderWidth:1.5, borderColor:COLORS.BORDER, borderRadius:10, overflow:'hidden'},
  iErr: {borderColor:COLORS.FAILED},
  iIco: {marginLeft:12},
  iTxt: {flex:1, paddingHorizontal:10, paddingVertical:13, fontSize:14, color:COLORS.TEXT, fontWeight:'500'},
  eye:  {paddingHorizontal:12},

  /* Phone */
  phoneRow:   {flexDirection:'row', alignItems:'center', backgroundColor:COLORS.BG, borderWidth:1.5, borderColor:COLORS.BORDER, borderRadius:10, overflow:'hidden'},
  countryBox: {flexDirection:'row', alignItems:'center', gap:5, paddingHorizontal:10, paddingVertical:13, borderRightWidth:1, borderRightColor:COLORS.BORDER},
  flag:       {fontSize:16},
  cc:         {fontSize:13, fontWeight:'700', color:COLORS.TEXT},
  phoneTxt:   {flex:1, paddingHorizontal:12, fontSize:14, color:COLORS.TEXT, fontWeight:'500'},

  /* Photo */
  photoArea:   {alignItems:'center', paddingVertical:18},
  photoCircle: {width:90, height:90, borderRadius:45, overflow:'hidden', borderWidth:2.5, borderStyle:'dashed'},
  photoImg:    {width:'100%', height:'100%'},
  photoEmpty:  {flex:1, alignItems:'center', justifyContent:'center'},
  photoTxt:    {fontSize:11, marginTop:5, fontWeight:'700'},
  removeBtn:   {flexDirection:'row', alignItems:'center', marginTop:8, gap:4},
  removeTxt:   {fontSize:12, color:COLORS.FAILED, fontWeight:'600'},

  /* Submit */
  submitBtn: {
    flexDirection:'row', alignItems:'center', justifyContent:'center',
    backgroundColor: COLORS.PRIMARY, borderRadius:13, paddingVertical:16,
    marginTop:16, marginBottom:4, gap:10,
    elevation:4, shadowColor:ACCENT, shadowOffset:{width:0,height:3}, shadowOpacity:0.3, shadowRadius:8,
  },
  submitTxt: {color:COLORS.WHITE, fontSize:16, fontWeight:'800'},
  loginRow:  {marginTop:12, alignItems:'center'},
  loginTxt:  {fontSize:12, color:COLORS.MUTED},
  loginBold: {fontWeight:'700'},
});
