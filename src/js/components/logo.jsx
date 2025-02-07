import React from 'react'
import { useViewport } from '../store/use-viewport'

export default function Logo () {
  const { style } = useViewport()
  const isDarkBasemap = ['dark', 'aerial'].includes(style.name)
  const hasDefaultLogo = !('logo' in style)

  return (
    <>
      {hasDefaultLogo && (
        <div className='fm-c-logo'>
          <svg xmlns='http://www.w3.org/2000/svg' width='90' height='24' fillRule='nonzero' role='img'><title>Ordnance Survey logo</title><path fill={isDarkBasemap ? '#000' : '#fff'} d='M30.084.001l1.602.005a9.8 9.8 0 0 1 6.325 3.312c.484.558.484 1.387-.012 1.959-.281.312-.681.493-1.103.497-.436.004-.851-.184-1.135-.512a6.83 6.83 0 0 0-4.099-2.266l-.437-.065-.381-.022.001 4.319.191.001a8.45 8.45 0 0 1 7.122 3.878c.002-.009.042.053.115.187l.239.418.059.112c.045.086.098.202.159.351l.01.021a8.65 8.65 0 0 1 .384 1.033l.042.14.045.149.16.76c.027.176.055.449.083.817.094 1.543-.244 3.115-.983 4.485l-.044.076c-.07.127-.228.38-.49.775-.014.021-.046.063-.095.125-.465.625-1.015 1.181-1.633 1.655l-.162.123-.468.318c-.415.263-.853.49-1.308.676l-.199.079-.2.073-1.127.33-.747.127-.034.006c-.091.015-.345.056-.959.056h-1.546c-2.885 0-5.631-1.235-7.711-3.447a1.5 1.5 0 0 1-.407-.788 1.53 1.53 0 0 1-.023-.205A11.97 11.97 0 0 1 12 24C5.373 24 0 18.628 0 12S5.373 0 12 0c4.174 0 7.85 2.131 10 5.364l.017-.035.304-.626a8.42 8.42 0 0 1 2.295-2.876l.402-.303A8.31 8.31 0 0 1 29.337.011C29.374.009 29.464 0 29.5 0l.584.001zm28.944 2.148a1.1 1.1 0 0 1 1.097 1.095v1.423c.053-.008.106-.012.161-.012h.861c.192-.001.374.048.532.135a3.26 3.26 0 0 1 1.431-.292c1.223 0 2.111.512 2.626 1.426.7-.879 1.745-1.422 2.87-1.422a3.39 3.39 0 0 1 1.436.297c.161-.092.347-.144.544-.143h.865a1.09 1.09 0 0 1 .627.197 1.09 1.09 0 0 1 .622-.194h.866c.193-.001.375.048.534.136.448-.202.941-.304 1.444-.293 1.228.004 2.116.524 2.626 1.447.692-.9 1.768-1.457 3.033-1.457.946 0 1.851.235 2.509.911l.105.115a3.65 3.65 0 0 1 2.571-1.015c2.28 0 3.611 1.589 3.611 4.117 0 .397-.211.745-.527.937l.256.686a1.09 1.09 0 0 1-.329 1.267c-.84.708-1.889.987-3.01.987-.997 0-1.856-.335-2.502-.914l-.066.063c-.693.571-1.588.851-2.628.851-1.013 0-1.9-.354-2.566-.955a1.09 1.09 0 0 1-1.05.789h-.945c-.604 0-1.096-.49-1.096-1.095V8.499l-.003-.369c-.007-.33-.035-.545-.079-.658-.017.002-.04.007-.084.007-.263 0-.629.263-.629.315v3.441c0 .291-.116.57-.322.776s-.484.32-.773.32H72.7a1.09 1.09 0 0 1-.617-.19c-.177.126-.396.201-.632.201h-.945a1.09 1.09 0 0 1-.513-.128c-.429.186-.897.284-1.374.283-.947 0-1.784-.329-2.427-.888-.153.422-.558.722-1.031.722h-.943c-.604 0-1.096-.49-1.096-1.095V8.318l-.002-.187c-.007-.329-.036-.543-.082-.662-.014.006-.037.01-.081.01-.264 0-.629.262-.629.315v3.459c-.011.599-.5 1.077-1.097 1.077h-.943c-.226 0-.444-.07-.627-.197-.178.125-.396.199-.631.199h-.943a1.09 1.09 0 0 1-.508-.125c-.43.189-.899.289-1.379.289-2.013 0-3.528-1.478-3.743-3.498l-.018-.208-.03.197c-.045.317-.067.57-.067.759v1.489c0 .295-.119.577-.329.783s-.492.317-.768.312h-.943c-.604 0-1.096-.49-1.096-1.095l.001-.485a5.02 5.02 0 0 1-1.406 1.155 4.11 4.11 0 0 1 .381.212c.24.162.407.411.463.686.065.307-.005.627-.177.856l-.49.694c-.318.439-.909.58-1.447.302a2.18 2.18 0 0 0-.886-.3c-.299 0-.396.07-.396.181 0 .003.162.115.691.266.839.222 1.535.548 2.07.972l-.001-.81c.011-.599.5-1.077 1.097-1.077h.945c.29 0 .568.115.773.32s.322.484.322.776v2.845c.001.52.024.776.081.924l.001.004c.017-.007.04-.012.084-.012.264 0 .629-.262.629-.313v-3.448c0-.291.116-.57.322-.776s.483-.32.773-.32h.939c.228-.001.449.069.634.198a1.09 1.09 0 0 1 .628-.198h.861c.151-.001.296.03.429.085a2.76 2.76 0 0 1 1.143-.247 3.65 3.65 0 0 1 .83.116 1.1 1.1 0 0 1 .151.051l.12-.005h.963c.468-.01.892.28 1.043.698l.771 1.973.797-1.971a1.09 1.09 0 0 1 1.022-.7h.951a1.1 1.1 0 0 1 .842.38 3.7 3.7 0 0 1 1.953-.537c.724 0 1.352.16 1.872.459a1.1 1.1 0 0 1 .754-.302h.965c.468-.01.891.28 1.043.698l.784 2.011.803-2.009c.167-.433.588-.713 1.023-.701h.95l.073.003c.529.039.952.45 1.009.972a1.13 1.13 0 0 1-.008.331l-.062.213-2.468 5.923c-.608 1.408-1.639 2.349-2.92 2.571l-.17.015h-.018c-.318-.005-.618-.148-.832-.401l-.514-.627c-.237-.29-.31-.682-.192-1.038.096-.291.308-.525.584-.652l-.178-.091c-.738.439-1.595.62-2.496.62-1.649 0-2.923-.915-3.474-2.336l-.642 1.505c-.172.407-.572.67-1.009.668h-.913c-.432-.003-.823-.26-1.003-.67l-1.702-4.042c-.232.026-.483-.025-.74-.165.018.012.042.018-.032.021-.193 0-.318.28-.318.784v2.978c0 .291-.116.57-.322.776s-.484.32-.773.32h-.945a1.09 1.09 0 0 1-.629-.199 1.06 1.06 0 0 1-.629.199h-.842a1.1 1.1 0 0 1-.551-.134 3.25 3.25 0 0 1-1.431.291c-1.184 0-2.054-.48-2.576-1.339-.643.832-1.698 1.339-2.946 1.339-1.398-.015-2.691-.493-3.523-1.388-.327-.402-.327-.979-.043-1.324l.496-.709c.182-.257.465-.423.718-.449.355-.06.718.06.925.28a2.28 2.28 0 0 0 1.474.612c.098.003.193-.034.262-.103s.105-.161.101-.302c.002-.203-.109-.284-.922-.505-1.864-.508-3.009-1.698-3.009-3.322a2.92 2.92 0 0 1 1.315-2.497c-1.694-.826-2.863-2.628-2.863-4.696 0-2.839 2.204-5.169 4.944-5.169 1.852 0 3.461 1.064 4.309 2.631a1.07 1.07 0 0 1 .486-.115h.861c.151-.001.296.029.428.085.349-.16.734-.246 1.134-.247.285.004.568.043.809.108.293.067.537.248.688.488.578-.38 1.255-.596 1.964-.596a3.39 3.39 0 0 1 .806.085V3.244c0-.606.491-1.095 1.096-1.095h.943zM23.853 14.034l-.021-.023a11.92 11.92 0 0 1-1.48 4.062 1.49 1.49 0 0 1 .467-.073c.429.007.836.192 1.106.495 1.49 1.588 3.389 2.47 5.376 2.515h.727l-.002-4.406-.186-.001a8.34 8.34 0 0 1-5.987-2.568l-.021-.023zm44.845-6.555c-.431 0-.711.383-.711 1.02 0 .681.236 1.017.711 1.019.378 0 .713-.433.713-1.019 0-.746-.232-1.02-.713-1.02zm-12.422 0c-.432 0-.713.383-.713 1.02 0 .685.234 1.017.713 1.019.378 0 .713-.433.713-1.019 0-.746-.232-1.02-.713-1.02zM45.506 5.123c-.969 0-1.813.959-1.813 2.194s.845 2.194 1.813 2.194 1.811-.958 1.811-2.194-.843-2.194-1.811-2.194zM81.2 7.466c-.463 0-.711.357-.711 1.02 0 .764.216 1.019.754 1.019a1.42 1.42 0 0 0 .923-.282 1.09 1.09 0 0 1 .479-.243c-.016-.156-.024-.317-.024-.482a4.73 4.73 0 0 1 .023-.47l-.047-.002c-.255-.025-.495-.137-.679-.316l-.081-.089c-.107-.133-.183-.156-.636-.156z' opacity='.7' /><path fill={isDarkBasemap ? '#fff' : '#453c90'} d='M57.99 10.708c-.459.502-1.11.789-1.792.788-1.605 0-2.769-1.262-2.769-2.997 0-1.853 1.438-2.997 2.769-2.997a2.39 2.39 0 0 1 1.792.77V3.244c0-.053.043-.095.096-.095h.943c.053 0 .096.042.097.095v7.993c-.001.053-.044.095-.097.095h-.943c-.053 0-.096-.043-.096-.095v-.529zm-3.425-2.209c0 .97.444 2.013 1.713 2.019 1.072 0 1.713-1.028 1.713-2.019 0-1.266-.64-2.02-1.713-2.02-1.182 0-1.713 1.047-1.713 2.02zm5.722 2.831c-.025 0-.05-.01-.068-.028s-.028-.042-.028-.067V5.75c0-.053.043-.095.096-.095h.865c.049 0 .091.037.096.086l.055.543c.456-.517 1.118-.805 1.808-.786 1.424 0 2.148.929 2.148 2.759v2.978c-.001.053-.044.095-.097.095h-.943c-.053 0-.096-.043-.096-.095V8.499c0-.476 0-1.003-.152-1.391-.166-.43-.483-.629-1.014-.629-.656 0-1.629.552-1.629 1.315v3.441c-.001.053-.044.095-.097.095h-.943zm15.015 3.557c.048.004.086.042.088.09.003.015.003.029 0 .044l-2.463 5.911c-.483 1.119-1.254 1.823-2.173 1.981h-.002c-.029 0-.056-.013-.074-.035l-.513-.626c-.021-.026-.027-.06-.017-.092s.036-.055.068-.064c.89-.22 1.407-.709 1.723-1.631l-2.288-5.447c-.015-.028-.015-.062 0-.09s.049-.042.081-.042h.985c.04-.001.077.024.09.062l1.704 4.372 1.748-4.374c.014-.037.05-.061.09-.06h.95zM45.506 3.148c2.176 0 3.947 1.87 3.947 4.169s-1.773 4.178-3.947 4.178-3.944-1.879-3.944-4.178 1.769-4.169 3.944-4.169zm2.811 4.169c0-1.761-1.26-3.194-2.811-3.194s-2.813 1.433-2.813 3.194 1.263 3.194 2.813 3.194 2.811-1.431 2.811-3.194zm5.66 7.57c.026 0 .05.009.069.027s.029.042.029.068v5.484c0 .026-.01.05-.029.068s-.043.028-.069.027h-.863c-.05.001-.092-.037-.096-.086l-.057-.543a2.32 2.32 0 0 1-1.808.786c-1.424 0-2.148-.927-2.148-2.759v-2.978c.001-.053.044-.095.097-.095h.945c.025 0 .05.01.068.028s.028.042.028.067v2.741c0 .497 0 1.003.15 1.393.168.428.485.628 1.016.628.656 0 1.629-.552 1.629-1.313v-3.448c0-.025.01-.049.028-.067s.042-.028.068-.028h.943zm10.428.042c.018.027.022.062.009.092l-2.342 5.483c-.015.035-.05.058-.088.058h-.906c-.038 0-.073-.023-.088-.058l-2.309-5.484c-.012-.029-.009-.063.009-.09s.048-.043.08-.042h.984c.04-.001.077.024.09.062l1.686 4.317 1.746-4.319c.014-.036.049-.06.088-.06h.961c.033 0 .063.016.081.042zm2.703-.199c1.684 0 2.611 1.107 2.611 3.124 0 .026-.009.05-.027.068s-.043.029-.068.029H65.48c.069.887.527 1.798 1.628 1.798.809 0 1.53-.245 1.974-.672.024-.023.058-.032.09-.025s.057.03.067.06l.276.74c.014.038.004.08-.027.108-.74.631-1.704.763-2.381.763-1.656 0-2.771-1.204-2.771-2.997 0-1.738 1.166-2.997 2.771-2.997zm-1.617 2.406h3.077c-.166-.97-.633-1.423-1.46-1.423s-1.451.554-1.617 1.423zm-15.19-5.807c-.053 0-.096-.043-.096-.095V5.759c0-.053.043-.095.096-.095h.865c.049 0 .091.037.096.086l.05.497a1.69 1.69 0 0 1 1.398-.746c.203.003.405.031.602.083.044.01.075.049.074.093v.857c0 .034-.018.066-.048.083s-.066.017-.096 0c-.171-.114-.376-.165-.58-.145-1.226 0-1.32 1.366-1.32 1.784v2.978c0 .026-.01.05-.029.068s-.043.028-.069.027h-.943zm36.088-5.828C88.073 5.502 89 6.607 89 8.619c0 .053-.043.095-.096.095h-4.143c.069.889.529 1.798 1.628 1.798.819 0 1.527-.25 1.978-.673.023-.022.055-.032.087-.025s.059.029.071.06l.276.74c.02.041.008.09-.03.116-.74.633-1.702.765-2.381.765-1.656 0-2.769-1.208-2.769-2.997 0-1.738 1.164-2.997 2.769-2.997zm-1.617 2.398h3.077c-.166-.97-.633-1.423-1.46-1.423s-1.451.555-1.617 1.423zm-39.099 7.868c1.714.451 2.583 1.32 2.581 2.584-.007 1.394-1.081 2.368-2.611 2.368-1.143-.012-2.174-.393-2.758-1.019-.028-.035-.028-.085 0-.12l.494-.705c.016-.023.041-.038.069-.041s.055.005.074.025a3.28 3.28 0 0 0 2.123.881c.375.013.738-.13 1.003-.394s.408-.627.394-1c.009-.95-.745-1.231-1.66-1.479-1.468-.4-2.272-1.239-2.272-2.357 0-1.458 1.313-2.133 2.532-2.133.7.003 1.386.2 1.98.569a.1.1 0 0 1 .042.063.09.09 0 0 1-.016.072l-.483.684c-.029.04-.082.052-.126.03-.425-.253-.904-.404-1.398-.441-.688 0-1.396.358-1.396 1.158-.018.772.805 1.077 1.426 1.253zm12.574-.957c.044.011.074.05.074.095v.86c0 .035-.019.067-.05.085s-.066.016-.096 0c-.172-.114-.377-.165-.582-.145-1.223 0-1.318 1.366-1.318 1.784v2.978c0 .025-.01.049-.028.067s-.042.028-.068.028h-.945c-.053 0-.096-.043-.096-.095v-5.484c0-.025.01-.049.028-.067s.042-.028.068-.028h.865c.049 0 .091.037.096.086l.05.497a1.69 1.69 0 0 1 1.398-.746 2.65 2.65 0 0 1 .603.085zm24.666-4.851c.031.011.053.038.058.071l.244.74c.012.038 0 .079-.03.104-.501.413-1.171.622-1.992.622-1.677 0-2.85-1.269-2.85-3.008s1.203-2.997 2.861-2.997c.412 0 1.433.079 1.964.813.024.033.024.078 0 .111l-.398.575a.09.09 0 0 1-.074.042c-.03-.003-.058-.016-.08-.037-.395-.49-.855-.529-1.415-.529-1.263 0-1.711 1.088-1.711 2.02 0 1.282.623 2.019 1.711 2.019a2.44 2.44 0 0 0 1.624-.529c.024-.021.058-.028.088-.018zm-14.292 1.537c-1.605 0-2.769-1.268-2.769-2.997 0-1.853 1.437-2.997 2.769-2.997.692-.01 1.353.28 1.813.795l.057-.555c.005-.049.046-.087.096-.086h.865c.053 0 .096.043.096.095v5.495c0 .053-.043.095-.096.095h-.945c-.053 0-.096-.043-.096-.095v-.529c-.46.499-1.11.782-1.79.779zm-1.633-2.997c0 .97.449 2.013 1.711 2.019 1.072 0 1.713-1.028 1.713-2.019 0-1.266-.64-2.02-1.713-2.02-1.18 0-1.711 1.047-1.711 2.02zm8.543-2.997c1.426 0 2.148.926 2.141 2.755v2.978c0 .053-.043.095-.096.095h-.945c-.053 0-.096-.043-.096-.095V8.499c0-.476 0-1.003-.15-1.391-.168-.43-.485-.629-1.016-.629-.655 0-1.629.552-1.629 1.315v3.441c0 .025-.01.049-.028.067s-.042.028-.068.028H72.7c-.053 0-.096-.043-.096-.095V5.754c0-.053.043-.095.096-.095h.87c.049 0 .091.037.096.086l.055.543a2.33 2.33 0 0 1 1.81-.786zM10.216 22.848l-.214-.035-.24-.046c-1.04-.215-2.043-.581-2.979-1.086l.032-.191c.236-1.486.48-3.021 1.093-4.409a1.22 1.22 0 0 0 .301-.536l2.342.075.457.008c.19-.012.373-.074.531-.18.17.108.367.165.569.164a1.02 1.02 0 0 0 .742-.313c.425.209.832.388 1.348.388h.108c.571-.047 1.137-.148 1.69-.3l1.741-.47c-.455.51-.95.982-1.479 1.413-.747.54-1.543 1.005-2.379 1.39a4.65 4.65 0 0 0-1.215.872 3.93 3.93 0 0 0-.593.865l-.117.207a5.7 5.7 0 0 1-.253.382c-.185.24-.337.504-.45.786l-.326 1.04-.021.068-.687-.093zm4.477-4.023c.831 1.134 2.051 1.804 3.305 2.389-1.786 1.167-3.869 1.788-5.997 1.787-.214 0-.427-.007-.636-.02l.31-.988c.1-.242.232-.469.393-.675a4.55 4.55 0 0 0 .275-.416l.12-.213c.139-.278.313-.535.519-.766a4.21 4.21 0 0 1 1.095-.784l.616-.313zM7.199 6.405a27.19 27.19 0 0 0-.459-4.066 11 11 0 0 1 12.097 1.045 2.67 2.67 0 0 0-.198.225c-.164.231-.294.485-.384.754l-.106.266-.145.332c-.242.598-.538 1.173-.884 1.717a6.77 6.77 0 0 1-.962 1.072l-.687.704-.177.23-.427-.389-.097-.179a.72.72 0 0 1-.143-.393c.014-.141.214-.298.368-.425l.126-.107c.046-.04.074-.097.078-.158s-.017-.121-.058-.166-.096-.073-.156-.077-.119.017-.164.057a2.29 2.29 0 0 1-.113.095c-.216.168-.478.393-.531.704-.018.249.052.496.197.699l.025.048a5.9 5.9 0 0 0-.14.207c-.221.345-.384.566-.604.536-.561-.086-.68.232-.793.536s-.197.734.381.972l.159.068a4.09 4.09 0 0 0 .65.232 2.53 2.53 0 0 0 .377.063l.517.021 1.063.061c.484.023.964.104 1.429.243.283.089.459.372.593.625.22.414.43.868.684 1.474.182.413.394.813.632 1.195l.089.148a3.31 3.31 0 0 1-.365.179 21.27 21.27 0 0 1-3.215.995c-.518.142-1.047.236-1.582.28-.446.027-.806-.138-1.213-.331.023-.087.035-.177.035-.268.015-.455-.297-.855-.739-.949l.048-.563a7.98 7.98 0 0 0 .066-1.054l-.03-.573-.028-.661v-.109c-.004-.656-.011-1.629-.739-1.965-.499-.208-1.043-.285-1.58-.225a3.37 3.37 0 0 0-.413.059c-.283.05-.613.109-.79.014-.117-.061-.159-.25-.186-.447-.025-.219-.036-.439-.03-.659v-.152a14.06 14.06 0 0 0-.043-.916l-.021-.357-.027-.357c-.048-.356-.048-.716 0-1.072a45.46 45.46 0 0 0 .252-1.429c.021-.125-.063-.243-.187-.264s-.241.064-.261.188l-.25 1.415a4.28 4.28 0 0 0-.011 1.193l.025.357.023.357.041.893v.15a5.27 5.27 0 0 0 .034.715c.028.197.113.624.436.786s.719.091 1.073.029a3.38 3.38 0 0 1 .354-.054c.465-.052.936.015 1.369.195.478.211.478 1.009.478 1.545v.114l.03.684.028.557a8.04 8.04 0 0 1-.062.993l-.051.593a.95.95 0 0 0-.808.967 1 1 0 0 0 .119.473c-.103.057-.22.081-.337.068l-2.641-.095c-.016-.19-.077-.374-.177-.536-.652-1.426-.829-3.026-1.006-4.577l-.032-.261c.134-1.429.193-2.863.177-4.298zm2.526.222h-.004c-.011.185-.001.37.028.552.012.111.09.531.19.579s.352 0 .453 0h1.155v-.879h-.26V5.765h-1.162c-.131 0-.182-.027-.25.059-.135.17-.14.598-.151.802zm-3.661 8.583l-.067 1.994c-.636-.07-1.24-.366-1.24-.993s.643-.945 1.307-1zm.639.032c.23.036.452.114.654.232a.84.84 0 0 1 .439.736c0 .577-.547.891-1.153.981l.06-1.949zm13.803-.598l2.297-.579a10.97 10.97 0 0 1-1.213 3.325 10.66 10.66 0 0 0-.93-1.174 1.75 1.75 0 0 0-.498-.332 1.91 1.91 0 0 1-.292-.179c-.137-.132-.236-.298-.287-.482.319-.153.617-.348.886-.579.012.002.025.002.037 0zm.542-1.417a5.93 5.93 0 0 1-.822 1.034c-.122.109-.252.208-.39.297a7.14 7.14 0 0 1-.092-.155 9.11 9.11 0 0 1-.611-1.149l-.708-1.511c-.085-.17-.19-.329-.314-.473l-.37-4.716a14.17 14.17 0 0 0 .67-1.408l.142-.331.115-.282c.076-.227.183-.443.319-.64a2.44 2.44 0 0 1 .195-.214c2.027 1.739 3.351 4.168 3.72 6.826l-.142.211-1.534 2.262-.177.25zm-5.009-2.594l-1.08-.064-.375-.018.09-.143a12.95 12.95 0 0 1 1.148-1.649c.204-.236.436-.459.659-.674.307-.284.594-.591.857-.916l.294 3.752-.048-.021c-.502-.153-1.021-.242-1.544-.266zm5.383 2.853l.17-.245 1.376-2.028a11.44 11.44 0 0 1 .032.79c-.001.524-.039 1.048-.113 1.567l-1.856.468.391-.552zm-6.405-4.429a21.81 21.81 0 0 0-.733 1.111l-.198.316c-.174-.053-.344-.117-.51-.191l-.156-.071c-.198-.082-.234-.109-.129-.388s.105-.279.303-.25c.519.075.829-.393 1.05-.736l.055-.084.319.293zm-8.293 5.721l.145-2.126c.109.794.293 1.576.547 2.335-.219-.103-.453-.174-.693-.209zM4.666 17.11c.55 1.343 1.006 2.723 1.366 4.13-2.097-1.353-3.675-3.387-4.47-5.767l.011-.014.136-.093c.229-.136.437-.306.616-.504l.639.504.462.372a4.62 4.62 0 0 0 .508.329l.377.238c.021.297.147.577.354.79zM1.439 9.814l-.177-.157c.379-1.732 1.169-3.346 2.303-4.702l.043.779.267 3.988.012.102c.035.32.027.431-.103.498a1.23 1.23 0 0 1-.468.084l-.19.014c-.096.009-.2.03-.31.052-.236.043-.503.096-.629 0-.257-.202-.507-.434-.749-.657zm-.285.357l.758.657.044.03.085 2.783c.002.088.011.182.021.277a1.73 1.73 0 0 1 0 .482c-.046.211-.367.427-.6.584l-.041.027A10.97 10.97 0 0 1 1 12.002a11.12 11.12 0 0 1 .154-1.831zm20.153 7.605l.03.05c-.759 1.213-1.743 2.266-2.899 3.101-1.263-.595-2.52-1.236-3.335-2.323.5-.265.979-.569 1.431-.909a13.22 13.22 0 0 0 1.56-1.492l.577-.604a11.86 11.86 0 0 0 .496-.191 1.43 1.43 0 0 0 .43.665 2.22 2.22 0 0 0 .354.213 1.36 1.36 0 0 1 .381.239 11.47 11.47 0 0 1 .974 1.251zm-9.749-2.146a.52.52 0 0 1 .16-.385.51.51 0 0 1 .39-.14c.138-.003.273.044.381.132a.49.49 0 0 1 .161.393.55.55 0 0 1-.546.55.55.55 0 0 1-.546-.55zm-4.92 2.022c.232-.027.459-.085.675-.173-.274.768-.483 1.558-.627 2.362l-.035-.87-.012-1.318zm-.678-4.288l.126-.447.168-.586-.168 2.421c-.226.014-.449.055-.664.123a3.63 3.63 0 0 0 .248-.536 13.3 13.3 0 0 0 .29-.975zm.051 5.626l.034.825a27.86 27.86 0 0 0-.79-2.337 2.57 2.57 0 0 0 .742.179l.014 1.333zM4.061 5.697l-.067-1.234a11.08 11.08 0 0 1 2.141-1.785c.226 1.233.362 2.481.406 3.734.035 1.293-.043 2.608-.142 3.904L5.69 12.79l-.128.461-.282.947c-.089.231-.198.453-.328.663l-.177.339a1.27 1.27 0 0 0-.411.586l-.211-.125a4.22 4.22 0 0 1-.459-.295 11.72 11.72 0 0 1-.455-.357l-.73-.573a2.21 2.21 0 0 0 0-.563l-.019-.243-.074-2.653c.16-.008.319-.03.475-.066.087-.02.184-.046.264-.046l.177-.013a1.58 1.58 0 0 0 .652-.134c.437-.225.388-.666.354-.959l-.011-.095-.267-3.966z' /><path fill={isDarkBasemap ? '#fff' : '#d40058'} d='M29.459 22.011v-.002c.274 0 .496.222.496.495s-.222.495-.496.495c-2.604 0-5.088-1.118-6.998-3.147a.52.52 0 0 1-.111-.56c.08-.178.257-.293.453-.293.15.002.292.067.392.179 1.715 1.827 3.937 2.832 6.264 2.832zm2.004-20.049v.004c-.253-.031-.44-.252-.426-.507s.223-.455.478-.459h.061a8.8 8.8 0 0 1 5.679 2.974c.158.182.158.453 0 .635-.094.105-.228.165-.369.166s-.279-.06-.372-.168a7.83 7.83 0 0 0-5.051-2.645zm.045 11.462l-.481-.116v-2.199c.428.107.666.29.766.585a4.34 4.34 0 0 1 .161.808 4.57 4.57 0 0 0 .204.975l.041.102-.691-.154zm.864-1.935c-.227-.658-.816-.894-1.337-1.009V8.229a7.45 7.45 0 0 1 6.592 3.952l-.426.336-.14.122c-.063.061-.132.116-.204.166h-.021a32.33 32.33 0 0 1-1.283-.751.23.23 0 0 0-.355.178.23.23 0 0 0 .103.205l.07.034-.383.136-.109.036a.66.66 0 0 0-.485.401c-.021.046-.048.12-.075.2-.042.128-.092.254-.15.376-.197.011-.834 0-1.271 0-.059-.116-.112-.236-.157-.358-.089-.276-.149-.56-.179-.848a4.79 4.79 0 0 0-.188-.924zm.567 11.215c-.007.005-.013.01-.018.016-.358.096-.722.165-1.09.207-.268.029-.401.089-.601-.045-.124-.078-.2-.212-.204-.358v-.486-4.376l2.112 4.649-.199.392zm2.54-3.988c.392.594 1.024.975 1.559 1.243-.453.608-.996 1.143-1.611 1.586l-.444-.628a.23.23 0 0 0-.338-.041l-1.144.992-.036.036-2.432-5.352V13.78l.369.089c.339.094.685.162 1.034.204a3.83 3.83 0 0 0 1.038 1.225c.258.186.852.511 1.332.409.206-.042.384-.173.485-.358.109-.223.17-.467.179-.715.059-.737.281-.796.426-.699.285.19.12.672-.1 1.164l-.045.102a6.89 6.89 0 0 0-.596 1.727c-.124.616-.008 1.255.324 1.788zM38 13.941c.102.052.206.089.308.136.394 1.846.059 3.772-.934 5.377h-.011c-.476-.243-1.043-.578-1.371-1.073a1.84 1.84 0 0 1-.231-1.348c.111-.545.294-1.072.544-1.568l.045-.102c.191-.426.583-1.431-.199-1.888-1.348-.789-1.006 1.364-1.401 1.591-.027.014-.032.043-.079.054-.199.039-.601-.123-.839-.302a3.04 3.04 0 0 1-.675-.715h.428c.264.016.528-.002.787-.052.166-.095.258-.327.369-.642l.061-.163c.045-.102.052-.104.206-.154l.123-.039.589-.209.079-.032c.023-.011.066-.032.055-.032.043.009.773.436.773.436l.537.295a.22.22 0 0 0 .115.03c.083 0 .159-.044.199-.116.03-.053.038-.116.022-.174a.23.23 0 0 0-.108-.139l-.107-.059.077-.068.12-.104.345-.277a7.65 7.65 0 0 1 .34.914c-.117-.046-.249.012-.295.129s.012.249.129.295zm-2.957 7.868c-.472.299-.976.544-1.503.73a1.31 1.31 0 0 1 .256-.32l.952-.828.295.418zm-8.745-9.892l-1.736-1.518c-.209-1.662-.75-3.265-1.591-4.714l1.357 1.152c.095.079.159.19.179.313a5.7 5.7 0 0 1 .161.858 7.57 7.57 0 0 0 .131.755 3.43 3.43 0 0 0 .855 1.701 2.94 2.94 0 0 0 2.157.907 3.42 3.42 0 0 0 .424-.027l1.602-.277v1.967l-2.815-.774c-.05-.016-.115-.03-.179-.045-.104-.017-.206-.046-.304-.086-.056-.036-.106-.078-.15-.127l-.089-.084zm.609.783l2.937.808v2.094a7.34 7.34 0 0 1-5.269-2.26 12.33 12.33 0 0 0 .082-1.393l-.032-.882 1.371 1.196.072.066c.077.083.166.153.265.207a1.61 1.61 0 0 0 .413.125l.161.038zm2.488-11.691c.485-.027.449.52.449.52v8.925l-1.677.293a2.38 2.38 0 0 1-2.064-.696 2.82 2.82 0 0 1-.702-1.418c-.052-.215-.082-.438-.115-.672l.034.021c.222.173.489.28.77.309a1.01 1.01 0 0 0 .524-.147c.134-.075.197-.091.256-.075.222.075.431.188.616.333.1.075.113.084-.054.392l-.043.08c-.078.15-.02.334.129.413a.32.32 0 0 0 .143.036c.114 0 .218-.063.27-.165l.041-.075c.145-.277.417-.771-.12-1.171-.242-.192-.515-.34-.807-.438a.92.92 0 0 0-.694.116c-.073.05-.159.078-.247.082-.383-.038-.881-.443-.934-.443-.021-.093-.043-.157-.072-.25-.054-.237-.184-.449-.37-.604L23.347 5.2a.31.31 0 0 0-.127-.061 7.39 7.39 0 0 1 1.999-2.516l.013.027a.23.23 0 0 0 .209.134.22.22 0 0 0 .095-.02.23.23 0 0 0 .115-.304l-.055-.122a7.31 7.31 0 0 1 3.8-1.33zm4.653 10.123c-.041.045-.062.105-.058.166s.031.118.076.158l.465.409c.042.034.094.053.149.054a.23.23 0 0 0 .149-.406l-.455-.399a.23.23 0 0 0-.326.018zm-.716-1.06v.004a.23.23 0 0 0-.319-.063.23.23 0 0 0-.063.318 1.43 1.43 0 0 0 .149.179l.179.179.111.118c.043.046.103.072.166.072s.116-.023.159-.063c.091-.088.095-.233.009-.325l-.111-.116c-.063-.055-.12-.118-.179-.179-.037-.039-.071-.08-.102-.123zM32.275 8.68l.004.004c-.098.078-.115.22-.038.318a2.39 2.39 0 0 1 .286.479.23.23 0 0 0 .206.129c.035 0 .069-.008.1-.023.055-.026.098-.073.118-.13s.016-.121-.011-.175c-.092-.202-.207-.393-.344-.569-.038-.047-.094-.077-.154-.083s-.121.012-.168.051zm-6.187-4.479c.028.002.056-.001.082-.009a.23.23 0 0 0 .124-.126c.023-.057.022-.12-.002-.177l-.118-.268-.131-.313a.23.23 0 0 0-.304-.113.23.23 0 0 0-.113.304l.136.302.115.259a.23.23 0 0 0 .211.139zm.843 1.336a.23.23 0 0 0 .095-.148c.011-.06-.003-.122-.038-.172l-.251-.392-.063-.113a.23.23 0 0 0-.398-.015.23.23 0 0 0-.009.229l.068.125c.086.15.183.293.274.426a.23.23 0 0 0 .19.1.24.24 0 0 0 .131-.041zm1.23.969c.019-.059.013-.123-.016-.178a.23.23 0 0 0-.139-.112l-.227-.072c-.087-.024-.171-.062-.247-.111-.018-.015-.034-.032-.048-.05a.23.23 0 0 0-.322-.036.23.23 0 0 0-.036.322c.037.049.081.092.129.131a1.32 1.32 0 0 0 .396.179l.075.023.055.018.095.03c.051.018.107.018.157 0a.23.23 0 0 0 .129-.145zm1.349.551a.23.23 0 0 0-.129-.299l-.578-.229a.23.23 0 0 0-.311.248.23.23 0 0 0 .143.18l.576.229c.027.01.057.016.086.016a.23.23 0 0 0 .213-.145z' /></svg>
        </div>
      )}
    </>
  )
}
