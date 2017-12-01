<?php 
    include './globalvariable.php';
    $data = $_POST['data'];
    $data = json_decode($data, true);
    /*
     * delete data manipulate
     */
    echo json_encode(array(
        'code' => 200,
        'message' => 'delete success',
        'data' => $data
    ));
?>