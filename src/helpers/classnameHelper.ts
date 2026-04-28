export const getClassnames = (boolean: boolean, className: string): string => { 

    if (!boolean) { 
        return ""
    }

    return className
}

export const applyClassnames = (boolean: boolean, classNamesToApply: string, currentClassnames?: string): string => { 

    if (!boolean) { 
        return currentClassnames ?? ""
    }

    return `${currentClassnames ?? ""} ${classNamesToApply}`
}