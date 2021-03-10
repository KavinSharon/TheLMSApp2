import * as React from 'react';

import { View,Text,StyleSheet,TouchableOpacity,TextInput,Image, KeyboardAvoidingView,Alert,ToastAndroid} from 'react-native';


import * as Permissions from 'expo-permissions';
import {BarCodeScanner}from 'expo-barcode-scanner';
import * as firebase from 'firebase'
import db from '../Config'
export default class BookTransaction extends React.Component{
  constructor(){
    super()
    this.state = {
     hasCameraPermission:null,
     scannedStudentID:"",
     scannedBookID:"",
     scanned:false,
     buttonState:'normal',
     transactionMessage:"",
     
    }
  }
  
  
  getCameraPermission = async(ID)=>{
    const {status}=await Permissions.askAsync(Permissions.CAMERA)
    this.setState({
      hasCameraPermission:status==="granted",
      buttonState:ID,
      scanned:false,
      
      
    })
  }

  initiateBookIssue = async()=>{
     
    db.collection("transactions").add({
      'studentID':this.state.scannedStudentID,
      'bookID':this.state.scannedBookID,
     // 'date':firebase.firestore.Timestamp.now().toDate(),
      'transactionType':"issue"
       
    })
    db.collection("booksCollection").doc(this.state.scannedBookID).update({
      'bookAvailability':false
    })
    db.collection("studentCollection").doc(this.state.scannedStudentID).update({
      'noOfBooksIssued':firebase.firestore.FieldValue.increment(1)
    })
    this.setState({
      scannedBookID:'',
      scannedStudentID:'',
      
    })
  }

  initiateBookReturn = async()=>{
    console.log(this.state.scannedStudentID)
    db.collection("transactions").add({
      'studentID':this.state.scannedStudentID,
      'bookID':this.state.scannedBookID,
      //'date':firebase.firestore.Timestamp.now().toDate(),
      'transactionType':"return"
    })
    db.collection("booksCollection").doc(this.state.scannedBookID).update({
      'bookAvailability':true
    })
    db.collection("studentCollection").doc(this.state.scannedStudentID).update({
      'noOfBooksIssued':firebase.firestore.FieldValue.increment(-1)
    })
    this.setState({
      scannedBookID:'',
      scannedStudentID:'',
    })
  }

  handleTransaction = async()=>{
    var transactionType = await this.checkBookEligibility()
    console.log(this.state.scannedStudentID)
    if(!transactionType){
      console.log("transactionType",transactionType)
      Alert.alert("This Book Doesn't Exist In The Library Database")
      this.setState({
        scannedBookID:'',
        scannedStudentID:'',
      })
    } else if(transactionType === "issue"){
      console.log("transactionType",transactionType)
       var isStudentEligible = await this.checkStudentEligibilityForIssue()
       if(isStudentEligible){
        this.initiateBookIssue()
        Alert.alert("Book Issued To The Student") 
       }
      } else {
        console.log("transactionType",transactionType)
        var isStudentEligible = await this.checkStudentEligibilityForReturn()
        if(isStudentEligible){
          this.initiateBookReturn()
          Alert.alert("Book Returned To The Library")
          
        }
      }  
  }
   checkStudentEligibilityForIssue = async()=>{
     console.log(this.state.scannedStudentID)
     const studentRef = await db.collection("studentCollection").where("studentID","==",this.state.scannedStudentID).get()
     var isStudentEligible = ""
     if(studentRef.docs.length === 0){
       console.log(studentRef.docs.length)
       this.setState({
         scannedStudentID:'',
         scannedBookID:'',
         
       })
       isStudentEligible = false
       Alert.alert("This Student ID Does Not Exist In The Database")

      }
      else{
        studentRef.docs.map((doc)=>{
         var student = doc.data()
         if(student.noOfBooksIssued<2){
          isStudentEligible = true
          
         }
         else{
           isStudentEligible = false
           Alert.alert("The Student has Already Taken Two Books")
           this.setState({
            scannedStudentID:'',
            scannedBookID:'', 
           })
         }
         })
      }
      return isStudentEligible
    }

  checkStudentEligibilityForReturn = async()=>{
    const transactionRef = await db.collection("transactions").where("bookID","==",this.state.scannedBookID).limit(1).get()
    var isStudentEligible = ""
     
      
    transactionRef.docs.map((doc)=>{
      var lastBookTransaction = doc.data()
        if(lastBookTransaction.studentID === this.state.scannedStudentID){
           isStudentEligible = true
        }
        else{
          isStudentEligible = false
          Alert.alert("The Book Was Not Issued To That Student")
          this.setState({
            scannedStudentID:'',
            scannedBookID:'', 
          })
        }
    })
       
       return isStudentEligible
  }
  
  checkBookEligibility = async()=>{
    const bookRef = await db.collection("booksCollection").where("bookID","==",this.state.scannedBookID).get()
    var transactionType = ""
    if(bookRef.docs.length === 0){
      transactionType = false
     }
     else{
       bookRef.docs.map((doc)=>{
        var book = doc.data()
        if(book.bookAvailability){
         transactionType = "issue"
         
        }
        else{
          transactionType = "return"
        }
        })
     }
     return transactionType
   }

  
  handleBarCodeScan = async({data})=>{
    const {buttonState}=this.state
    if(buttonState === "BookID"){
      this.setState({
        scanned:true,
        scannedBookID:data,
        buttonState:'normal',
      })
    }else if(buttonState === "StudentID"){
      this.setState({
        scanned:true,
        scannedStudentID:data,
        buttonState:'normal',
        
      }) 
    }
    
   
  }
  render(){
    const hasCameraPermission = this.state.hasCameraPermission;
    const scanned = this.state.scanned;
    const buttonState = this.state.buttonState;
    if(buttonState!=="normal"&& hasCameraPermission){
      
      return(
        <BarCodeScanner
           onBarCodeScanned = {scanned? undefined:this.handleBarCodeScan}
           style = {StyleSheet.absoluteFillObject}/>
      )
    }  
    else if(buttonState==="normal"){
    
    
      return(
        <KeyboardAvoidingView
          style = {styles.container}
          behavior = "padding"
          enabled>
          <View
            style = {styles.container}

          >
            <View>
               <Image
                  style ={styles.bookLogo}
                  source = {require("../assets/booklogo.jpg")}
               /> 

                <Text
                   style = {styles.title}>
                    The LMS App
                    
                </Text>  
            </View>
              
            <View
             style = {styles.inputView}>
                 <TextInput
                   style = {styles.inputBox}
                   placeholder = {"Book ID"}
                   onChangeText = {text => {this.setState({
                       scannedBookID:text
                      })}}
                   value = {this.state.scannedBookID}/>
                 <TouchableOpacity
                   style = {styles.scanButton}
                   onPress = {()=>{this.getCameraPermission("BookID")}}>
                    <Text
                     style = {styles.scanText}>
                      Scan
                    </Text>
                 </TouchableOpacity>
            </View>

            <View
             style = {styles.inputView}>
                 <TextInput
                   style = {styles.inputBox}
                   placeholder = {"Student ID"}
                   onChangeText = {text => {this.setState({
                    scannedStudentID:text
                   })}}
                   value = {this.state.scannedStudentID}/>
                 <TouchableOpacity
                   style = {styles.scanButton}
                   onPress = {()=>{this.getCameraPermission("StudentID")}}>
                    <Text
                     style = {styles.scanText}>
                      Scan
                    </Text>
                 </TouchableOpacity>
            </View>
             

             <TouchableOpacity
                onPress = {()=>{
                this.handleTransaction()
                // this.setState({
                //  scannedBookID:'',
                //  scannedStudentID:'',
                //  })
              }}
              style = {styles.submitButton}>
               <Text
                 style = {styles.submitButtonText}>
                   Submit</Text>
             </TouchableOpacity>
          </View>
         </KeyboardAvoidingView>
      )
    }
  }
};


const styles = StyleSheet.create({
   container:{
       flex:1,
       justifyContent:'center',
       alignItems:'center',
   },
   submitButton:{
      backgroundColor:"blue",
      padding:10,
      margin:20,
      borderWidth:2,
   },
   submitButtonText:{
     fontSize:20,
     textDecorationLine:"underline",
     color:"white"
   },
   scannedDataText:{
     fontSize:15,
   },
   bookLogo:{
     width:200,
     height:200,
   },
   title:{
     textAlign:'center',
     fontSize:35,
   },
   inputBox:{
     width:200,
     height:40,
     borderWidth:2,
   },
   inputView:{
     flexDirection:'row',
     margin:20,
   },
   scanButton:{
     backgroundColor:"lime",
     width:80,
     borderWidth:2,
     marginLeft:30,
   },
   scanText:{
     textAlign:'center',
     fontSize:20,
     color:"navy"
   },
})