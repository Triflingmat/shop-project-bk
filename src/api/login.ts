import axios from "axios"

export const login = async (username:string,password:string)=>{
    try{
        const res = await axios.post('http://39.106.151.177:8082/api/login',{
                username,
                password
        })
        console.log(res)
        if(res.data.code !== 200){
            throw new Error(res.data.msg)
        }
        
        let userData:any = null;
        if(res.data.data){
            userData = parseToken(res.data.data)
        }
        console.log(userData)
        return {
            userData:userData,
            token:res.data.data
        }
    }catch(error){
        console.log(error)
        throw error
    }
    
}

//token解析函数
export function parseToken(token: string) {
  const payload = token.split('.')[1];
  const decoded = atob(payload || '');
  console.log(JSON.parse(decoded))
  return JSON.parse(decoded);
}
