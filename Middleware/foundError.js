export function NotFound(req,res){
    res.status(404).json({message :"URL Not Found"});
}