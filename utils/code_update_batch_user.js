//
//
// var Verification = Parse.Object.extend("Verification");
// var query = new Parse.Query(Verification);
// query.equalTo("type", "Verification");
// query.equalTo("complete", true);
// query.equalTo("status", "Verified");
//
// query.limit(1000);
// query.find({
//     success:verifications=>{
//
//
//         verifications = verifications.map(item=>item.get('user').id)
//         let _User = Parse.Object.extend("_User");
//         let query2 = new Parse.Query(_User);
//         query2.containedIn('objectId',verifications)
//         query2.limit(1000);
//
//         query2.find(
//             {
//                 success:(results)=>{
//
//
//
//                     results = results.map(item=> {
//                         item.set('accountVerifiedStatus', "Complete");
//                         item.set('accountVerified', true);
//                         return item;
//                     })
//
//                     setTimeout(()=>{
//
//                         Parse.Object.saveAll(results,{useMasterKey:true}).then(()=>{
//                             console.log('ok');
//                         }).catch(err=>{
//                             console.log('err',err);
//                         });
//
//                     },1000)
//
//
//
//                 }
//             }
//         )
//
//     },
//     error:(o,err)=>{
//         console.log('err');
//         console.log('err',err);
//     }
// })
//
