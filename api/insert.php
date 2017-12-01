<?php 
    include './globalvariable.php';
    
    $data = $_POST['data'];
    $data = json_decode($data, true);
    /*
     * insert data manipulate
     */
    
    array_push($database, $data);
    echo json_encode(array(
        'code' => 200,
        'message' => 'insert success',
        'data' => $data
    ));
?>