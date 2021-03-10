import * as React from 'react';

import { View,Text,StyleSheet,FlatList, TextInput, TouchableOpacity} from 'react-native';

import db from '../Config'
export default class SearchScreen extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      allTransactions:[],
      lastVisibleTransaction:null,
      search:'',
    }
  }

  componentDidMount = async()=>{
    const query = await db.collection("transactions").get()
    query.docs.map((doc)=>{
      this.setState ({
        allTransactions:[...this.state.allTransactions,doc.data()],
      })
    })
  }
  
  searchTransactions = async(text)=>{
    var enteredText = text.split("")
    var text = text.toUpperCase()
    if(enteredText[0].toUpperCase()==='B'){
      const transaction = await db.collection("transactions").where('bookID','==',text).get()
      transaction.docs.map((doc)=>{
        this.setState ({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc,
        })
      })

    }else if(enteredText[0].toUpperCase()==='S'){
      const transaction = await db.collection("transactions").where('studentID','==',text).get()
      transaction.docs.map((doc)=>{
        this.setState ({
          allTransactions:[...this.state.allTransactions,doc.data()],
          lastVisibleTransaction:doc,
        })
      })

    }
  }


  fetchMoreTransactions = async()=>{
    var text = this.state.search.toUpperCase()
    var enteredText = text.split("")

    if(enteredText[0].toUpperCase()==='B'){
     const query = await db.collection("transactions").where('bookID','==',text).startAfter(this.state.lastVisibleTransaction).get()
     query.docs.map((doc)=>{
       this.setState ({
         allTransactions:[...this.state.allTransactions,doc.data()],
         lastVisibleTransaction:doc,
       })
     })
    }else if(enteredText[0].toUpperCase()==='S'){
      const query = await db.collection("transactions").where('studentID','==',text).startAfter(this.state.lastVisibleTransaction).get()
     query.docs.map((doc)=>{
       this.setState ({
         allTransactions:[...this.state.allTransactions,doc.data()],
         lastVisibleTransaction:doc,
       })
     })
    }
  }
  render(){
    
      return(
        <View style ={styles.container}>
          <View style ={styles.searchBar}>
            <TextInput 
            style ={styles.searchBox}
             placeholder = "Enter Book ID/Student ID"
             onChangeText = {(text)=>{this.setState({
               search:text,
             })}}></TextInput>
            <TouchableOpacity 
             onPress = {()=>{
               this.searchTransactions(this.state.search)
             }}
             style ={styles.searchButton}>
              <Text style ={styles.searchText}>Search</Text>
            </TouchableOpacity>
          </View>
        
           <FlatList
             data ={this.state.allTransactions}
             renderItem = {({item})=>(  
              <View
               style = {{borderBottomWidth:2}}>
               <Text>{"Book ID:"+item.bookID}</Text>
               <Text>{"Student ID:"+item.studentID}</Text>
               <Text>{"Transaction Type:"+item.transactionType}</Text>
              </View>
             )}
             keyExtractor = {(item,index)=>index.toString()}
             onEndReached = {this.fetchMoreTransactions}
             onEndReachedThreshold = {0.7}
               
             
            />
            </View>
          
      )

  }
};


const styles = StyleSheet.create({
   container:{
       flex:1,
       marginTop:20,
      },
    searchBar:{
     flexDirection:'row',
     height:40,
     width:'auto',
     borderWidth:0.5,
     alignItems:'center',
     backgroundColor:"#add8e6",
    },
    searchBox:{
     height:40,
     width:300,
     borderWidth:2,
     paddingLeft:10,
    },
    searchButton:{
     height:40,
     width:300,
     borderWidth:1,
     alignItems:'center',
     justifyContent:"center",
     backgroundColor:"yellow",
    },
    searchText:{
      fontSize:20,
    }, 
})
