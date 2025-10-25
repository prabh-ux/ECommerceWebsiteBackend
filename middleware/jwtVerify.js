import jwt from 'jsonwebtoken';
export const jwtVerify = (req, res,next) => {

    try {

        const token = req.cookies.token;
        if (!token)
            return res.status(404).json({ loggedIn: false });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded) {
            return res.json({ loggedIn: false });
        }
        req.user = decoded;
        next();
    }
    catch (error) {
        return res.json({ loggedIn: false });

    }


}