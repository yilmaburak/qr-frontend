import React from 'react'
import Input, { InputProps } from './Input'
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const InputPassword = (props: InputProps) => {
    const [showPassword, setShowPassword] = React.useState(false);

    return (
        <Input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            Icon={showPassword ? (<FaEye className='hover:text-white transition-colors' />) : (<FaEyeSlash className='hover:text-white transition-colors' />)}
            iconOnRight={true}
            iconProps={{ onClick: () => setShowPassword((prev) => !prev) }}
            iconClassName='cursor-pointer'
            {...props}
        />
    )
}

export default InputPassword