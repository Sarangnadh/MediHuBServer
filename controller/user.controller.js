
const User = require('../models/User');
const jwt = require('jsonwebtoken');

exports.registerUser =async(req,res)=>{
    try{
        const { name, email, password, role } = req.body;
        
            const existing = await User.findOne({ email });
            if (existing) {
              return res.status(409).json({ message: 'User already exists' });
            }
        
            const user = new User({ name, email, password, role });
            await user.save();
        
            res.status(201).json({ message: 'User registered successfully', user });
    }
    catch (error) {
    res.status(500).json({ message: 'Error registering user', error });
  }
}


exports.loginUser =async(req,res)=>{
   try{
     const { email, password } = req.body;
    
        const user = await User.findOne({ email });
    
        if (!user) {
          return res.status(401).json({ message: 'Invalid email or user does not exist' });
        }
    
        if (user.password !== password) {
          return res.status(401).json({ message: 'Invalid password' });
        }
    
           const token = jwt.sign(
          { userId: user._id, email: user.email },
          process.env.JWT_SECRET,
          { expiresIn: '2h' }
        );
        res.status(200).json({ message: 'User login successful',token, user });
        console.log("Login successful");  
   }
    catch (error) {
    res.status(500).json({ message: 'Error logging in user', error });
  }
}


exports.getNotifications =async(req,res)=>{
     try {
        const user = await User.findById(req.user.userId);
    
        if (!user) {
          return res.status(404).json({ message: 'User not found' });
        }
    
        res.status(200).json({
          notifications: user.notifications
        });
      } catch (error) {
        res.status(500).json({ message: 'Failed to fetch notifications', error });
      }
}