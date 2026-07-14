import React, {useState, useRef} from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  ScrollView, Image, Alert, ActivityIndicator,
  Platform, KeyboardAvoidingView, Modal, FlatList,
  PermissionsAndroid,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {launchImageLibrary, launchCamera} from 'react-native-image-picker';
import Icon from 'react-native-vector-icons/Feather';
import {COLORS} from '../theme/colors';
import {employeeApi} from '../api/employeeApi';

const DEPARTMENTS = [
  'Production','Logistics','Human Resources','Finance & Accounts',
  'Sales & Marketing','Quality Control','Warehouse','Administration',
  'IT & Systems','Procurement',
];

const INDUSTRIES = [
  'Manufacturing','Trading','Services','Healthcare','Education',
  'Retail','IT / Software','Logistics','Construction','Other',
];

/** Format a JS Date → "DD/MM/YYYY" for display */
function formatDisplay(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/** Format a JS Date → "YYYY-MM-DD" for API */
function formatISO(date) {
  const dd = String(date.getDate()).padStart(2, '0');
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const yyyy = date.getFullYear();
  return `${yyyy}-${mm}-${dd}`;
}

/** Parse "DD/MM/YYYY" → JS Date (returns null on failure) */
function parseDisplayDate(str) {
  if (!str || !/^\d{2}\/\d{2}\/\d{4}$/.test(str)) return null;
  const [dd, mm, yyyy] = str.split('/').map(Number);
  const d = new Date(yyyy, mm - 1, dd);
  return isNaN(d.getTime()) ? null : d;
}

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

export default function EmployeeRegistrationScreen({navigation}) {
  const scrollRef  = useRef(null);
  const [loading,     setLoading]     = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [photo,    setPhoto]    = useState(null);
  const [showPwd,  setShowPwd]  = useState(false);
  const [showCPwd, setShowCPwd] = useState(false);
  const [deptModal,    setDeptModal]     = useState(false);
  const [industryModal,setIndustryModal] = useState(false);

  // ── Native date picker ─────────────────────────────────────────────────────
  // pickerDate: the JS Date currently shown in the native picker
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [pickerDate,     setPickerDate]     = useState(new Date());

  /** Open native calendar; pre-fill from existing form value if present */
  const openDatePicker = () => {
    const existing = parseDisplayDate(form.joiningDate);
    setPickerDate(existing || new Date());
    setShowDatePicker(true);
  };

  /**
   * Called by DateTimePicker when user selects a date.
   * Stores display format (DD/MM/YYYY) in form for the user to see.
   * The ISO format (YYYY-MM-DD) is derived at submit time.
   */
  const onDateChange = (event, selectedDate) => {
    // Always hide picker on Android after any interaction
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (!selectedDate) return; // dismissed without selection
    setPickerDate(selectedDate);
    if (Platform.OS === 'android') {
      // On Android, confirmed date arrives here — save immediately
      upd('joiningDate', formatDisplay(selectedDate));
    }
    // On iOS we wait for the "Done" button (confirmIOSDate)
  };

  /** iOS only — "Done" button handler */
  const confirmIOSDate = () => {
    upd('joiningDate', formatDisplay(pickerDate));
    setShowDatePicker(false);
  };

  const [form, setForm] = useState({
    fullName:'', mobileNumber:'', email:'',
    password:'', confirmPassword:'',
    department:'', designation:'', joiningDate:'',
    gstNumber:'', panNumber:'', industry:'', address:'', gender:'',
  });
  const [E, setE] = useState({});

  const upd = (k, v) => {
    setForm(p => ({...p, [k]: v}));
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
    if (!form.department)              e.department      = 'Select department';
    if (!form.designation.trim())      e.designation     = 'Required';
    if (!form.joiningDate.trim())      e.joiningDate     = 'Date of Joining is required';
    else if (!/^\d{2}\/\d{2}\/\d{4}$/.test(form.joiningDate)) e.joiningDate = 'Invalid date — tap calendar to select';
    if (!form.gender)                  e.gender          = 'Select gender';
    setE(e);
    return Object.keys(e).length === 0;
  };

  const IMAGE_OPTIONS = {
    mediaType: 'photo',
    quality: 0.7,
    maxWidth: 800,
    maxHeight: 800,
    saveToPhotos: false,
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
    launchCamera({...IMAGE_OPTIONS, cameraType: 'back', includeBase64: false}, onPick);
  };

  const openGallery = () => {
    launchImageLibrary({...IMAGE_OPTIONS, includeBase64: false, selectionLimit: 1}, onPick);
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
    if (a) setPhoto({uri: a.uri, type: a.type || 'image/jpeg', fileName: a.fileName || `emp_${Date.now()}.jpg`});
  };

  const submit = async () => {
    if (!validate()) { scrollRef.current?.scrollTo({y:0, animated:true}); return; }
    setLoading(true);
    try {
      await employeeApi.register({...form, userRole: 'employee', profilePhoto: photo||null});
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        navigation.replace('Login', {prefillEmail: form.email.trim()});
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

      {/* ══════════════════════════════════════════════
          HEADER — red background + logo + title
      ══════════════════════════════════════════════ */}
      <View style={S.header}>
        {/* Back button */}
        <TouchableOpacity style={S.backBtn} onPress={()=>navigation.goBack()}>
          <Icon name="arrow-left" size={20} color={COLORS.WHITE} />
        </TouchableOpacity>

        {/* Center: logo + brand */}
        <View style={S.headerCenter}>
          <Image
            source={require('../assets/logo.png')}
            style={S.logo}
            resizeMode="contain"
          />
          <Text style={S.headerTitle}>Employee Registration</Text>
          <Text style={S.headerSub}>Sri Chakra Industries</Text>
        </View>

        <View style={{width:40}} />
      </View>

      {/* ══════════════════════════════════════════════
          SCROLLABLE BODY
      ══════════════════════════════════════════════ */}
      <ScrollView
        ref={scrollRef}
        contentContainerStyle={S.body}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>

        {/* ════════════════════════════════════════════
            ONE CARD — all fields
        ════════════════════════════════════════════ */}
        <View style={S.card}>

          {/* ── Personal Information ────────────────── */}
          <Divider title="Personal Information" />

          <Lbl text="Full Name" required />
          <View style={[S.iRow, E.fullName && S.iErr]}>
            <Icon name="user" size={15} color={E.fullName ? COLORS.FAILED : COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="e.g. Ravi Kumar"
              placeholderTextColor="#BBBBBB"
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
              placeholderTextColor="#BBBBBB" keyboardType="phone-pad"
              value={form.mobileNumber} onChangeText={v=>upd('mobileNumber',v)} maxLength={10} />
          </View>
          <Err msg={E.mobileNumber} />

          <Lbl text="Email ID" required />
          <View style={[S.iRow, E.email && S.iErr]}>
            <Icon name="mail" size={15} color={E.email ? COLORS.FAILED : COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="e.g. ravi@company.com"
              placeholderTextColor="#BBBBBB" keyboardType="email-address"
              autoCapitalize="none"
              value={form.email} onChangeText={v=>upd('email',v)} />
          </View>
          <Err msg={E.email} />

          {/* ── Account Security ────────────────────── */}
          <Divider title="Account Security" />

          <Lbl text="Password" required />
          <View style={[S.iRow, E.password && S.iErr]}>
            <Icon name="lock" size={15} color={E.password ? COLORS.FAILED : COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="Min 6 characters"
              placeholderTextColor="#BBBBBB" secureTextEntry={!showPwd}
              value={form.password} onChangeText={v=>upd('password',v)} />
            <TouchableOpacity onPress={()=>setShowPwd(p=>!p)} style={S.eye}>
              <Icon name={showPwd?'eye-off':'eye'} size={17} color={COLORS.MUTED} />
            </TouchableOpacity>
          </View>
          <Err msg={E.password} />

          <Lbl text="Confirm Password" required />
          <View style={[S.iRow, E.confirmPassword && S.iErr]}>
            <Icon name="shield" size={15} color={E.confirmPassword ? COLORS.FAILED : COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="Re-enter password"
              placeholderTextColor="#BBBBBB" secureTextEntry={!showCPwd}
              value={form.confirmPassword} onChangeText={v=>upd('confirmPassword',v)} />
            <TouchableOpacity onPress={()=>setShowCPwd(p=>!p)} style={S.eye}>
              <Icon name={showCPwd?'eye-off':'eye'} size={17} color={COLORS.MUTED} />
            </TouchableOpacity>
          </View>
          <Err msg={E.confirmPassword} />

          {/* ── Work Details ─────────────────────────── */}
          <Divider title="Work Details" />

          <Lbl text="Department" required />
          <TouchableOpacity
            style={[S.iRow, E.department && S.iErr]}
            onPress={()=>setDeptModal(true)} activeOpacity={0.8}>
            <Icon name="grid" size={15} color={E.department ? COLORS.FAILED : COLORS.MUTED} style={S.iIco} />
            <Text style={[S.iTxt, {flex:1, paddingVertical:13.5},
              !form.department && {color:'#BBBBBB'}]}>
              {form.department || 'Select department'}
            </Text>
            <Icon name="chevron-down" size={15} color={COLORS.MUTED} style={{marginRight:12}} />
          </TouchableOpacity>
          <Err msg={E.department} />

          <Lbl text="Designation" required />
          <View style={[S.iRow, E.designation && S.iErr]}>
            <Icon name="award" size={15} color={E.designation ? COLORS.FAILED : COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="e.g. Floor Supervisor"
              placeholderTextColor="#BBBBBB"
              value={form.designation} onChangeText={v=>upd('designation',v)} />
          </View>
          <Err msg={E.designation} />

        
          <Lbl text="Date of Joining" required />
          {/* Tappable row opens native calendar picker */}
          <TouchableOpacity
            style={[S.dateRow, E.joiningDate && S.iErr]}
            onPress={openDatePicker}
            activeOpacity={0.8}>
            {/* Selected date text — left */}
            <Text
              style={[S.dateTxt, !form.joiningDate && S.datePlaceholder]}
              numberOfLines={1}>
              {form.joiningDate || 'Select Date of Joining'}
            </Text>
            {/* Calendar icon — right */}
            <View style={S.calIconBtn}>
              <Icon name="calendar" size={17} color={COLORS.PRIMARY} />
            </View>
          </TouchableOpacity>
          <Err msg={E.joiningDate} />

          {/*
            ── Native Date Picker ─────────────────────────────────────────────
            Android: renders inline dialog, hidden after selection.
            iOS:     rendered inside a Modal with a "Done" button overlay.
          */}
          {Platform.OS === 'android' && showDatePicker && (
            <DateTimePicker
              value={pickerDate}
              mode="date"
              display="calendar"
              maximumDate={new Date(2100, 11, 31)}
              minimumDate={new Date(1980, 0, 1)}
              onValueChange={onDateChange}
            />
          )}

          {Platform.OS === 'ios' && (
            <Modal
              visible={showDatePicker}
              transparent
              animationType="slide"
              onRequestClose={() => setShowDatePicker(false)}>
              <View style={IOS.backdrop}>
                <View style={IOS.sheet}>
                  {/* Header */}
                  <View style={IOS.header}>
                    <TouchableOpacity
                      onPress={() => setShowDatePicker(false)}
                      style={IOS.cancelBtn}>
                      <Text style={IOS.cancelTxt}>Cancel</Text>
                    </TouchableOpacity>
                    <Text style={IOS.title}>Date of Joining</Text>
                    <TouchableOpacity
                      onPress={confirmIOSDate}
                      style={IOS.doneBtn}>
                      <Text style={IOS.doneTxt}>Done</Text>
                    </TouchableOpacity>
                  </View>
                  <DateTimePicker
                    value={pickerDate}
                    mode="date"
                    display="spinner"
                    maximumDate={new Date(2100, 11, 31)}
                    minimumDate={new Date(1980, 0, 1)}
                    onValueChange={onDateChange}
                    style={IOS.picker}
                  />
                </View>
              </View>
            </Modal>
          )}

          {/* ── Additional Details ───────────────────── */}
          <Divider title="Additional Details" />

          <Lbl text="GST Number" />
          <View style={S.iRow}>
            <Icon name="file-text" size={15} color={COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="e.g. 29ABCDE1234F1Z5"
              placeholderTextColor="#BBBBBB" autoCapitalize="characters"
              value={form.gstNumber}
              onChangeText={v=>upd('gstNumber',v.toUpperCase())} />
          </View>

          <Lbl text="PAN Number" />
          <View style={S.iRow}>
            <Icon name="credit-card" size={15} color={COLORS.MUTED} style={S.iIco} />
            <TextInput style={S.iTxt} placeholder="e.g. ABCDE1234F"
              placeholderTextColor="#BBBBBB" autoCapitalize="characters"
              maxLength={10}
              value={form.panNumber}
              onChangeText={v=>upd('panNumber',v.toUpperCase())} />
          </View>

          <Lbl text="Industry" />
          <TouchableOpacity
            style={S.iRow}
            onPress={()=>setIndustryModal(true)} activeOpacity={0.8}>
            <Icon name="briefcase" size={15} color={COLORS.MUTED} style={S.iIco} />
            <Text style={[S.iTxt, {flex:1, paddingVertical:13.5},
              !form.industry && {color:'#BBBBBB'}]}>
              {form.industry || 'Select industry'}
            </Text>
            <Icon name="chevron-down" size={15} color={COLORS.MUTED} style={{marginRight:12}} />
          </TouchableOpacity>

          <Lbl text="Address" />
          <View style={S.iRow}>
            <Icon name="map-pin" size={15} color={COLORS.MUTED} style={[S.iIco, {alignSelf:'flex-start', marginTop:14}]} />
            <TextInput
              style={[S.iTxt, S.textArea]}
              placeholder="Enter full address"
              placeholderTextColor="#BBBBBB"
              multiline
              numberOfLines={3}
              value={form.address}
              onChangeText={v=>upd('address',v)} />
          </View>

          <Lbl text="Gender" required />
          <View style={S.genderRow}>
            {['Male','Female','Other'].map(g => {
              const sel = form.gender === g;
              return (
                <TouchableOpacity
                  key={g}
                  style={[S.genderBtn, sel && S.genderBtnSel]}
                  onPress={()=>upd('gender',g)}
                  activeOpacity={0.8}>
                  <Text style={[S.genderTxt, sel && S.genderTxtSel]}>{g}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <Err msg={E.gender} />

          {/* ── Profile Photo ────────────────────────── */}
          <Divider title="Profile Photo" />

          <View style={S.photoArea}>
            <TouchableOpacity style={S.photoCircle} onPress={pickPhoto} activeOpacity={0.85}>
              {photo
                ? <Image source={{uri:photo.uri}} style={S.photoImg} />
                : (
                  <View style={S.photoEmpty}>
                    <View style={S.camBox}>
                      <Icon name="camera" size={22} color={COLORS.PRIMARY} />
                    </View>
                    <Text style={S.photoTxt}>Add Profile Photo</Text>
                    <Text style={S.photoSub}>Camera or Gallery</Text>
                  </View>
                )
              }
            </TouchableOpacity>
            {photo && (
              <TouchableOpacity onPress={()=>setPhoto(null)} style={S.removeBtn}>
                <Icon name="x-circle" size={13} color={COLORS.FAILED} />
                <Text style={S.removeTxt}>Remove Photo</Text>
              </TouchableOpacity>
            )}
          </View>

        </View>{/* end card */}

        {/* ── Submit button ─────────────────────────── */}
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
            Already have an account?{'  '}
            <Text style={S.loginBold}>Login</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ── Department Modal ───────────────────────── */}
      <Modal visible={deptModal} transparent animationType="slide" onRequestClose={()=>setDeptModal(false)}>
        <TouchableOpacity style={M.overlay} activeOpacity={1} onPress={()=>setDeptModal(false)}>
          <View style={M.sheet}>
            <View style={M.handle} />
            <Text style={M.title}>Select Department</Text>
            <FlatList
              data={DEPARTMENTS} keyExtractor={i=>i}
              renderItem={({item})=>(
                <TouchableOpacity
                  style={[M.item, form.department===item && M.itemActive]}
                  onPress={()=>{upd('department',item);setDeptModal(false);}}>
                  <Text style={[M.itemTxt, form.department===item && M.itemSel]}>{item}</Text>
                  {form.department===item && <Icon name="check" size={15} color={COLORS.PRIMARY} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Industry Modal ─────────────────────────── */}
      <Modal visible={industryModal} transparent animationType="slide" onRequestClose={()=>setIndustryModal(false)}>
        <TouchableOpacity style={M.overlay} activeOpacity={1} onPress={()=>setIndustryModal(false)}>
          <View style={M.sheet}>
            <View style={M.handle} />
            <Text style={M.title}>Select Industry</Text>
            <FlatList
              data={INDUSTRIES} keyExtractor={i=>i}
              renderItem={({item})=>(
                <TouchableOpacity
                  style={[M.item, form.industry===item && M.itemActive]}
                  onPress={()=>{upd('industry',item);setIndustryModal(false);}}>
                  <Text style={[M.itemTxt, form.industry===item && M.itemSel]}>{item}</Text>
                  {form.industry===item && <Icon name="check" size={15} color={COLORS.PRIMARY} />}
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      {/* ── Success Popup — with Continue button + auto-dismiss after 3 seconds ── */}
      <Modal visible={showSuccess} transparent animationType="fade">
        <View style={SP.backdrop}>
          <View style={SP.box}>
            <View style={SP.iconCircle}>
              <Icon name="check-circle" size={44} color={COLORS.WHITE} />
            </View>
            <Text style={SP.heading}>Registration Successful!</Text>
            <Text style={SP.sub}>
              Your account has been created successfully.{'\n'}Click Continue to proceed to login.
            </Text>
            <TouchableOpacity
              style={SP.continueBtn}
              onPress={() => { setShowSuccess(false); navigation.replace('Login', {prefillEmail: form.email.trim()}); }}
              activeOpacity={0.85}>
              <Icon name="arrow-right" size={16} color={COLORS.WHITE} />
              <Text style={SP.continueTxt}>Continue to Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </KeyboardAvoidingView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  root: {flex:1, backgroundColor:'#F1F3F8'},

  /* ── Header ── */
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.PRIMARY,
    paddingTop: Platform.OS === 'android' ? 14 : 52,
    paddingBottom: 18,
    paddingHorizontal: 14,
    elevation: 6,
    shadowColor: COLORS.PRIMARY,
    shadowOffset: {width:0, height:3},
    shadowOpacity: 0.28,
    shadowRadius: 8,
  },
  backBtn: {
    width: 38, height: 38, borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center', justifyContent: 'center',
  },
  headerCenter: {
    flex: 1, alignItems: 'center',
  },
  logo: {
    width: 120, height: 48,
    marginBottom: 6,
    borderRadius: 12,
    backgroundColor: COLORS.WHITE,
    padding: 4,
  },
  headerTitle: {fontSize: 16, fontWeight: '800', color: COLORS.WHITE},
  headerSub:   {fontSize: 11, color: 'rgba(255,255,255,0.72)', marginTop: 2},

  /* ── Body ── */
  body: {padding: 16, paddingBottom: 44},

  /* ── Single white card ── */
  card: {
    backgroundColor: COLORS.WHITE,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingTop: 4,
    paddingBottom: 22,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width:0, height:2},
    shadowOpacity: 0.08,
    shadowRadius: 8,
  },

  /* Section divider */
  divRow:  {flexDirection:'row', alignItems:'center', marginTop:22, marginBottom:2},
  divLine: {flex:1, height:1, backgroundColor:COLORS.BORDER},
  divTxt:  {
    fontSize: 10, fontWeight: '800', color: COLORS.MUTED,
    paddingHorizontal: 10, letterSpacing: 1, textTransform: 'uppercase',
  },

  /* Labels & errors */
  lbl:  {fontSize:12, fontWeight:'700', color:COLORS.TEXT, marginTop:12, marginBottom:6},
  star: {color:COLORS.FAILED},
  err:  {fontSize:11, color:COLORS.FAILED, fontWeight:'600', marginTop:3},

  /* Icon input row */
  iRow: {
    flexDirection:'row', alignItems:'center',
    backgroundColor: COLORS.BG,
    borderWidth: 1.5, borderColor: COLORS.BORDER,
    borderRadius: 11, overflow: 'hidden',
  },
  iErr: {borderColor: COLORS.FAILED, backgroundColor: '#FFF5F5'},
  iIco: {marginLeft: 12},
  iTxt: {
    flex:1, paddingHorizontal:10, paddingVertical:13,
    fontSize:14, color:COLORS.TEXT, fontWeight:'500',
  },
  eye:  {paddingHorizontal:12},

  /* Phone row */
  phoneRow: {
    flexDirection:'row', alignItems:'center',
    backgroundColor: COLORS.BG,
    borderWidth: 1.5, borderColor: COLORS.BORDER,
    borderRadius: 11, overflow: 'hidden',
  },
  countryBox: {
    flexDirection:'row', alignItems:'center', gap:5,
    paddingHorizontal:10, paddingVertical:13,
    borderRightWidth:1, borderRightColor:COLORS.BORDER,
  },
  flag:     {fontSize:16},
  cc:       {fontSize:13, fontWeight:'700', color:COLORS.TEXT},
  phoneTxt: {flex:1, paddingHorizontal:12, fontSize:14, color:COLORS.TEXT, fontWeight:'500'},

  /* Profile photo */
  photoArea:   {alignItems:'center', paddingVertical:16},
  photoCircle: {
    width: 96, height: 96, borderRadius: 48,
    overflow: 'hidden',
    borderWidth: 2, borderColor: COLORS.PRIMARY, borderStyle: 'dashed',
  },
  photoImg:  {width:'100%', height:'100%'},
  photoEmpty:{
    flex:1, alignItems:'center', justifyContent:'center',
    backgroundColor: COLORS.LIGHT_RED,
  },
  camBox: {
    width: 42, height: 42, borderRadius: 21,
    backgroundColor: COLORS.WHITE,
    alignItems: 'center', justifyContent: 'center',
    elevation: 2, shadowColor:'#000', shadowOpacity:0.1, shadowRadius:4,
  },
  photoTxt:  {fontSize:11, color:COLORS.PRIMARY, marginTop:7, fontWeight:'700'},
  photoSub:  {fontSize:10, color:COLORS.MUTED, marginTop:2},
  removeBtn: {flexDirection:'row', alignItems:'center', marginTop:8, gap:5},
  removeTxt: {fontSize:12, color:COLORS.FAILED, fontWeight:'600'},

  /* Submit */
  submitBtn: {
    flexDirection:'row', alignItems:'center', justifyContent:'center',
    backgroundColor: COLORS.PRIMARY,
    borderRadius: 14, paddingVertical: 16,
    marginTop: 16, marginBottom: 4, gap: 10,
    elevation: 4,
    shadowColor: COLORS.PRIMARY,
    shadowOffset:{width:0, height:3}, shadowOpacity:0.3, shadowRadius:8,
  },
  submitTxt: {color:COLORS.WHITE, fontSize:16, fontWeight:'800'},
  loginRow:  {marginTop:14, alignItems:'center'},
  loginTxt:  {fontSize:13, color:COLORS.MUTED},
  loginBold: {color:COLORS.PRIMARY, fontWeight:'800'},

  /* Date of joining row */
  dateRow: {
    flexDirection:'row', alignItems:'center',
    backgroundColor: COLORS.BG,
    borderWidth: 1.5, borderColor: COLORS.BORDER,
    borderRadius: 11, overflow: 'hidden',
  },
  dateTxt:         {flex:1, paddingHorizontal:14, paddingVertical:13, fontSize:14, color:COLORS.TEXT, fontWeight:'500'},
  datePlaceholder: {color:'#BBBBBB'},
  calIconBtn: {
    width: 46, height: '100%',
    minHeight: 48,
   backgroundColor: COLORS.BG,
    alignItems: 'center', justifyContent: 'center',
  },
  /* Keep old styles for backward compat — no longer used in JSX */
  calBtn:    {flexDirection:'row', alignItems:'center', gap:4, backgroundColor:COLORS.PRIMARY, paddingHorizontal:11, alignSelf:'stretch', justifyContent:'center'},
  calBtnTxt: {fontSize:12, color:COLORS.WHITE, fontWeight:'700'},

  /* Gender toggle */
  genderRow:    {flexDirection:'row', gap:8, marginTop:0},
  genderBtn:    {flex:1, paddingVertical:11, borderRadius:10, borderWidth:1.5, borderColor:COLORS.BORDER, alignItems:'center', backgroundColor:COLORS.WHITE},
  genderBtnSel: {backgroundColor:COLORS.PRIMARY, borderColor:COLORS.PRIMARY},
  genderTxt:    {fontSize:13, fontWeight:'600', color:COLORS.TEXT},
  genderTxtSel: {color:COLORS.WHITE, fontWeight:'700'},

  /* Text area */
  textArea: {minHeight:80, paddingTop:12, textAlignVertical:'top'},
});

/* Modal */
const M = StyleSheet.create({
  overlay: {flex:1, backgroundColor:'rgba(0,0,0,0.45)', justifyContent:'flex-end'},
  sheet:   {
    backgroundColor:COLORS.WHITE,
    borderTopLeftRadius:24, borderTopRightRadius:24,
    paddingBottom:32, maxHeight:'72%',
  },
  handle: {
    width:38, height:4, borderRadius:2,
    backgroundColor:COLORS.BORDER,
    alignSelf:'center', marginTop:12, marginBottom:4,
  },
  title:      {fontSize:15, fontWeight:'800', color:COLORS.TEXT, paddingHorizontal:20, paddingVertical:12},
  item:       {flexDirection:'row', alignItems:'center', justifyContent:'space-between', paddingVertical:14, paddingHorizontal:20, borderBottomWidth:1, borderBottomColor:COLORS.BORDER},
  itemActive: {backgroundColor:COLORS.LIGHT_RED},
  itemTxt:    {fontSize:14, color:COLORS.TEXT},
  itemSel:    {color:COLORS.PRIMARY, fontWeight:'700'},
});

/* ─── iOS Date Picker Modal styles ───────────────────────────────────────── */
const IOS = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: COLORS.WHITE,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingBottom: 34,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.BORDER,
  },
  title:     {fontSize: 15, fontWeight: '800', color: COLORS.TEXT},
  cancelBtn: {paddingVertical: 4, paddingHorizontal: 8},
  cancelTxt: {fontSize: 15, color: COLORS.MUTED, fontWeight: '600'},
  doneBtn:   {paddingVertical: 4, paddingHorizontal: 8},
  doneTxt:   {fontSize: 15, color: COLORS.PRIMARY, fontWeight: '800'},
  picker:    {width: '100%'},
});

/* ─── Success Popup ─────────────────────────────────────────────────────── */
const SP = StyleSheet.create({
  backdrop: {
    flex:1, backgroundColor:'rgba(0,0,0,0.58)',
    justifyContent:'center', alignItems:'center', paddingHorizontal:30,
  },
  box: {
    backgroundColor: COLORS.WHITE, borderRadius:24,
    paddingVertical:32, paddingHorizontal:28, alignItems:'center', width:'100%',
    elevation:14, shadowColor:'#000', shadowOffset:{width:0,height:6},
    shadowOpacity:0.22, shadowRadius:16,
  },
  iconCircle: {
    width:88, height:88, borderRadius:44,
    backgroundColor: COLORS.SUCCESS,
    alignItems:'center', justifyContent:'center',
    marginBottom:18,
    elevation:4, shadowColor:COLORS.SUCCESS,
    shadowOffset:{width:0,height:4}, shadowOpacity:0.35, shadowRadius:8,
  },
  heading: {fontSize:20, fontWeight:'800', color:COLORS.TEXT, textAlign:'center', marginBottom:8},
  sub:     {fontSize:13, color:COLORS.MUTED, textAlign:'center', lineHeight:20, marginBottom:22},
  bar:     {width:'100%', height:4, backgroundColor:COLORS.BORDER, borderRadius:2, overflow:'hidden'},
  barFill: {height:'100%', width:'100%', backgroundColor:COLORS.SUCCESS, borderRadius:2},
  continueBtn: {
    flexDirection:'row', alignItems:'center', justifyContent:'center', gap:8,
    backgroundColor: COLORS.SUCCESS,
    borderRadius:12, paddingVertical:14, paddingHorizontal:28,
    width:'100%',
    elevation:3, shadowColor:COLORS.SUCCESS, shadowOffset:{width:0,height:3}, shadowOpacity:0.3, shadowRadius:6,
  },
  continueTxt: {color:COLORS.WHITE, fontSize:15, fontWeight:'800'},
});
